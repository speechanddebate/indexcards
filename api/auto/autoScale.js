import db from '../helpers/litedb.js';
import config from '../../config/config.js';
import notify from '../helpers/blast.js';

import {
	getLinodeInstances,
	increaseLinodeCount,
	decreaseLinodeCount,
	showTabroomUsage,
} from '../helpers/servers.js';

const autoScale = async () => {

	const loadThresholds = config.AUTOSCALE;
	const usageData = await showTabroomUsage();
	const serverList = await getLinodeInstances(config.LINODE.WEBHOST_BASE);

	const user = {
		id       : 2,
		name     : 'Jon Bruschke',
		email    : 'jbruschke@gmail.com',
		greeting : 'Duuuuuude!',
	};

	// Calculate load figures
	const loadNumbers =  {
		one     : 0,
		fifteen : 0,
		cpus    : 0,
	};

	for (const server of serverList) {
		loadNumbers.cpus += parseInt(server.specs.vcpus);
		loadNumbers.one += parseFloat(server.loadOne);
		loadNumbers.fifteen += parseFloat(server.loadFifteen);
	}

	const onePercentage =  ( loadNumbers.one / loadNumbers.cpus ) * 100;
	const fifteenPercentage = ( loadNumbers.fifteen / loadNumbers.cpus ) * 100;

	// If load levels are very high, take action yourself
	if (onePercentage > (loadThresholds.SCALE_THRESHOLD || 120)
		&& fifteenPercentage > (loadThresholds.SCALE_15_THRESHOLD  || 100)
	) {

		let alert = `<p>Load levels are over capacity.  Adding another ${loadNumbers.SCALE_INCREMENT} servers</p>`;

		if (serverList.length >= config.LINODE.SCALE_MAX) {
			alert += `<h3>SERVER CLUSTER AT CAPACITY.</h3>`;
		} else if (loadThresholds?.ENABLED) {
			const response = await increaseLinodeCount(user, loadNumbers.SCALE_INCREMENT, true);
			alert += '<pre>';
			alert += JSON.stringify(response);
			alert += '</pre>';
		}

		await notifyCloudAdmins(alert, 'AutoScaling UP');
		return;
	}

	// If load levels are high in a sustained manner send out a hey yo shit goin' down

	if (onePercentage > (loadThresholds.ALERT_THRESHOLD || 80)
		&& fifteenPercentage > (loadThresholds.ALERT_15_THRESHOLD  || 60)
	) {

		let alert = `<p>Load levels are approaching capacity</p>`;
		alert += `<p>One minute load average across tabweb machines is ${onePercentage}</p>`;
		alert += `<p>One minute load average across tabweb machines is ${fifteenPercentage}</p>`;
		await notifyCloudAdmins(alert, 'AutoScaling May Be Required');
		return;
	}

	// Check if we are under the estimated count for servers right now.
	if (usageData.serverTarget > serverList.length) {
		const needed = usageData.serverTarget - serverList.length;
		let alert = `<p>Under forecasted needs. Spinning up ${needed} machines</p>`;

		if (loadThresholds?.ENABLED) {
			const response = await increaseLinodeCount(user, needed, true);
			alert += '<pre>';
			alert += JSON.stringify(response);
			alert += '</pre>';
		}
		await notifyCloudAdmins(alert, 'Scaled Up Based on Anticipated Capacity');
		return;
	}

	// Check if we are over our estimated count.  If we are, check load average
	// first to be sure we're under 20% before shrinking the world.

	if (usageData.serverTarget < serverList.length) {

		const needed = serverList.length - usageData.serverTarget;
		let alert = `<p>Over forecasted needs. Checking load levels to ensure extra capacity</p>`;

		if (onePercentage < 20 && fifteenPercentage < 20) {
			alert += `<p>Low load confirmed. ${onePercentage}% of capacity in active use. Destroying ${needed} machines</p>`;
		}

		if (loadThresholds?.ENABLED) {
			const response = await decreaseLinodeCount(user, needed, true);
			alert += '<pre>';
			alert += JSON.stringify(response);
			alert += '</pre>';
		}

		await notifyCloudAdmins(alert, 'Scaled Down Based on Anticipated Capacity');
	}

};

const notifyCloudAdmins = async (log, subject) => {

	// Testing Mode for Palmer Only
	let sqlLimit = '';

	if (!config.AUTOSCALE?.ENABLED) {
		sqlLimit = ' and person.id = 1 ';
	}

	const cloudAdmins = await db.sequelize.query(`
		select distinct person.id
			from person, person_setting ps
		where 1=1
			${sqlLimit}
			and person.id = ps.person
			and ps.tag = :tag
	`, {
		replacements: { tag: 'system_administrator' },
		type: db.sequelize.QueryTypes.SELECT,
	});

	const adminIds = cloudAdmins.map( item => item.id );

	const message = {
		ids     : adminIds,
		html    : log,
		from    : `Tabroom Autoscaler <autoscale@tabroom.com>`,
		subject : `Cloud Scale Change: ${subject}`,
	};

	if (config.LINODE.NOTIFY_SLACK) {
		message.emailInclude = [config.LINODE.NOTIFY_SLACK];
	}

	const emailResponse = await notify(message);
	return emailResponse;
};

await autoScale();
db.sequelize.close();
process.exit();
