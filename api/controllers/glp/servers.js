import axios from 'axios';
import notify from '../../helpers/blast.js';
import config from '../../../config/config.js';
import { errorLogger } from '../../helpers/logger.js';
import { getLinodeInstances, getProxyStatus, increaseLinodeCount, decreaseLinodeCount } from '../../helpers/servers.js';

// Moved the actual logic to a helper script so that these can be invoked on
// the command line from api/auto via node scaleServers.js increase 3 or
// node scaleServers show etc.

export const getInstances = {

	GET: async (req, res) => {
		const tabroomMachines = await getLinodeInstances();
		return res.status(200).json(tabroomMachines);
	},
};

export const getInstanceStatus = {

	GET: async (req, res) => {
		const proxyMachineStatus = await getProxyStatus([]);
		return res.status(200).json(proxyMachineStatus);
	},

	POST: async (req, res) => {
		const proxyMachineStatus = await getProxyStatus(req.body.existingMachines);
		return res.status(200).json(proxyMachineStatus);
	},
};

export const getTabroomUsage = {

	GET: async (req, res) => {

		const allStudents = await req.db.sequelize.query(`
			select
				count(distinct student.person) count
			from student, entry_student es, entry, event, tourn
			where tourn.start < DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY)
				and tourn.end > NOW()
				and tourn.id = event.tourn
				and tourn.hidden != 1
				and event.id = entry.event
				and entry.active = 1
				and entry.id = es.entry
				and es.student = student.id
				and exists (
					select timeslot.id
					from timeslot
					where timeslot.tourn = tourn.id
					and timeslot.start > CURRENT_TIMESTAMP
					and timeslot.end < DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY)
				)
		`, {
			type: req.db.sequelize.QueryTypes.SELECT,
		});

		const allJudges = await req.db.sequelize.query(`
			select
				count(distinct judge.person) count
			from judge, category, tourn
			where tourn.start < DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY)
				and tourn.end > CURRENT_TIMESTAMP
				and tourn.id = category.tourn
				and tourn.hidden != 1
				and category.id = judge.category
				and exists (
					select timeslot.id
					from timeslot
					where timeslot.tourn = tourn.id
					and timeslot.start > CURRENT_TIMESTAMP
					and timeslot.end < DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY)
				)
		`, {
			type: req.db.sequelize.QueryTypes.SELECT,
		});

		const tournamentCount = await req.db.sequelize.query(`
			select
				count(distinct tourn.id) count
			from tourn
			where tourn.start < DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY)
				and tourn.end > CURRENT_TIMESTAMP
				and tourn.hidden != 1
				and exists (
					select timeslot.id
					from timeslot
					where timeslot.tourn = tourn.id
					and timeslot.start > CURRENT_TIMESTAMP
					and timeslot.end < DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY)
				)
		`, {
			type: req.db.sequelize.QueryTypes.SELECT,
		});

		const currentActiveUsers = await req.db.sequelize.query(`
			select
				count(distinct session.id) count
			from session
				where session.last_access > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY)
		`, {
			type: req.db.sequelize.QueryTypes.SELECT,
		});

		const totalUsers = (allJudges[0]?.count || 0) + (allStudents[0]?.count || 0);
		let serverTarget = totalUsers / (config.LINODE.USERS_PER_SERVER || 1250);
		if (serverTarget < 3) {
			serverTarget = 3;
		}

		return res.status(200).json({
			activeUsers : currentActiveUsers[0]?.count,
			tournaments : tournamentCount[0]?.count,
			judges      : allJudges[0]?.count,
			students    : allStudents[0].count,
			totalUsers  : (allJudges[0]?.count || 0) + (allStudents[0]?.count || 0),
			serverTarget,
		});
	},
};

export const getTabroomInstance = {
	GET: async (req, res) => {

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
	},
};

export const changeInstanceCount = {

	POST: async (req, res) => {

		const user = {
			su    : req.session.su,
			id    : req.session.person,
			name  : `${req.session.name}`,
			email : req.session.email,
		};

		const serverCount = parseInt(req.params.target) || parseInt(req.body.target) || 0;
		const response = await increaseLinodeCount(user, serverCount);

		return res.status(200).json(response);
	},

	DELETE: async (req, res) => {

		const user = {
			su    : req.session.su,
			id    : req.session.person,
			name  : `${req.session.name}`,
			email : req.session.email,
		};

		const serverCount = parseInt(req.params.target) || parseInt(req.body.target) || 0;
		const response = await decreaseLinodeCount(user, serverCount);
		return res.status(200).json(response);
	},
};

export const rebootInstance = {

	POST: async (req, res) => {

		req.returnToSender = true;
		const machine = await getTabroomInstance.GET(req, res);

		if (!machine || !machine?.tags?.includes(config.LINODE.WEBHOST_BASE)) {
			return res.status(200).json({
				message: `Only active tabweb instances can be rebooted with this interface.  Please try again with another host.`,
			});
		}

		const resultMessages = [
			`${req.session.name} ${req.session.email} has REBOOTED ${machine}:\n`,
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
			person     : req.session.su || req.session.person,
			tag        : 'sitewide',
			created_at : new Date(),
			description: resultMessages.join('\n'),
		});

		await notifyCloudAdmins(req, resultMessages.join('<br />'), `${machine.label} Rebooted`);

		return res.status(200).json({
			message: resultMessages.join('<br />'),
		});
	},
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
		sender = await req.db.summon(req.db.person, req.session.person);
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

export default getInstances;
