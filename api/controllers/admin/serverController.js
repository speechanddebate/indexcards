import axios from 'axios';
import notify from '../../helpers/blast.js';
import config from '../../../config/config.js';
import { errorLogger } from '../../helpers/logger.js';
import {
	getLinodeInstances,
	getProxyStatus,
	increaseLinodeCount,
	decreaseLinodeCount,
	showTabroomUsage,
} from '../../helpers/servers.js';

// Moved the actual logic to a helper script so that these can be invoked on
// the command line from api/auto via node scaleServers.js increase 3 or
// node scaleServers show etc.

// Shows the instances that are currently alive according to the Linode API

export async function getInstances(req, res) {
	const tabroomMachines = await getLinodeInstances();
	return res.status(200).json(tabroomMachines);
};

// Shows CPU and memory load data from the machines themselves, as well as
// up/down data from the haproxy JSON dump.

export async function getInstanceStatus(req, res) {
	const proxyMachineStatus = await getProxyStatus([]);
	return res.status(200).json(proxyMachineStatus);
};

export async function getInstanceStatusPOST(req, res) {
	const proxyMachineStatus = await getProxyStatus(req.body.existingMachines);
	return res.status(200).json(proxyMachineStatus);
};

// Returns data about the current 24 hour period's projected tabroom usage.
export async function getTabroomUsage(req, res) {
// Moved function to a stub so that the auto api cron processes can
// also access it.  I know, I hate this sort of sixteen-nested-files
// thing, too.
	const usageData = await showTabroomUsage();
	return res.status(200).json(usageData);
};

// Show data about an individual machine; this is useful mostly in bringing up
// machines.
export async function getTabroomInstance(req, res) {
	const linodeData = await axios.get(
		`${config.LINODE.API_URL}/instances/${req.params.linodeId}`,
		{
			headers : {
				Authorization  : `Bearer ${config.LINODE.API_TOKEN}`,
				'Content-Type' : 'application/json',
				Accept         : 'application/json',
			},
		},
	);

	if (req.returnToSender) {
		return linodeData.data;
	}

	return res.status(200).json(linodeData.data);
};

// Simple counter of how many servers are currently running to display in the
// header of cloud service administrators.
export async function getTabroomInstanceCounts(req, res) {
	const tabwebCount = await req.db.sequelize.query(`
		select
			count(distinct id) as count
		from server
			where 1=1
			and hostname like 'tabweb%'
			and status = 'running'
	`, {
		type: req.db.Sequelize.QueryTypes.SELECT,
	});

	if (tabwebCount && tabwebCount.length > 0) {
		return res.status(200).json({ ...tabwebCount[0] });
	}
};

// API facing functions that will bring up or destroy machines.
export async function changeInstanceCount(req, res) {
	const user = {
		su    : req.session.su,
		id    : req.session.personId,
		name  : `${req.person.name}`,
		email : req.person.email,
	};

	const serverCount = parseInt(req.params.target) || parseInt(req.body.target) || 0;
	if (req.method === 'POST') {
		const response = await increaseLinodeCount(user, serverCount);
		return res.status(200).json(response);
	} else if (req.method === 'DELETE') {
		const response = await decreaseLinodeCount(user, serverCount);
		return res.status(200).json(response);
	}
};

export async function rebootInstance(req, res) {
	req.returnToSender = true;
	const machine = await getTabroomInstance.GET(req, res);

	if (!machine
		|| (
			!machine?.tags?.includes(config.LINODE.WEBHOST_BASE)
			&& !machine?.tags?.includes('tab-admin')
		)
	) {
		return res.status(200).json({
			message: `Only active tabweb instances can be rebooted with this interface.  Please try again with another host.`,
		});
	}

	const resultMessages = [
		`${req.person.name} ${req.person.email} has REBOOTED ${machine}:\n`,
		'\n',
	];

	try {

		const rebootReply = await axios.post(
			`${config.LINODE.API_URL}/instances/${machine.id}/reboot`,
			{},
			{
				headers : {
					Authorization  : `Bearer ${config.LINODE.API_TOKEN}`,
					'Content-Type' : 'application/json',
					Accept         : 'application/json',
				},
			},
		);

		if (parseInt(rebootReply.status) === 200) {
			resultMessages.push(`Machine ${machine.label} reboot request successful. This operation will take a few minutes.`);
		}

	} catch (err) {

		errorLogger.error(err.response.data);

		return res.status(200).json({
			message: `Deleting ${machine.label} failed with response code ${err.response.status} ${err.response.statusText} and errors ${err.response?.data?.errors}`,
		});
	}

	await req.db.changeLog.create({
		person     : req.session.su || req.session.personId,
		tag        : 'sitewide',
		created_at : new Date(),
		description: resultMessages.join('\n'),
	});

	await notifyCloudAdmins(req, resultMessages.join('<br />'), `${machine.label} Rebooted`);

	return res.status(200).json({
		message: resultMessages.join('<br />'),
	});
};

const notifyCloudAdmins = async (req, log, subject) => {

	const cloudAdmins = await req.db.sequelize.query(`
		select distinct person.id
			from person, person_setting ps
		where person.id = ps.person
			and ps.tag = :tag
	`, {
		replacements: { tag: 'system_administrator' },
		type: req.db.sequelize.QueryTypes.SELECT,
	});

	let sender = '';

	if (req.session.su) {
		sender = await req.db.summon(req.db.person, req.session.su);
	} else {
		sender = await req.db.summon(req.db.person, req.session.personId);
	}

	const adminIds = cloudAdmins.map( item => item.id );

	const message = {
		ids     : adminIds,
		html    : log,
		from    : `${sender.first} ${sender.last} <${sender.email}>`,
		subject : `Tabroom Cloud Change: ${subject}`,
	};

	if (config.LINODE.NOTIFY_SLACK) {
		message.emailInclude = [config.LINODE.NOTIFY_SLACK];
	}

	const emailResponse = await notify(message);
	return emailResponse;
};