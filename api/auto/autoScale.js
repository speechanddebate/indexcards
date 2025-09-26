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
		id       : 5,
		name     : 'Autoscale Daemon',
		email    : 'autoscaler@tabroom.com',
		greeting : 'Greetings, Human!',
	};

	// Calculate load figures
	const loadNumbers =  {
		one     : 0,
		fifteen : 0,
		cpus    : 0,
	};

	const servers = [];
	let database = {};

	for (const server of serverList) {
		if (server.tags.includes(config.DB_HOST)) {
			database = server;
			database.cpus += parseInt(server.specs.vcpus);
			database.one = (database.cpus / parseInt(server.loadOne)) * 100;
			database.fifteen = (database.cpus / parseInt(server.loadFifteen)) * 100;
		} else {
			loadNumbers.cpus += parseInt(server.specs.vcpus);
			loadNumbers.one += parseFloat(server.loadOne);
			loadNumbers.fifteen += parseFloat(server.loadFifteen);
			servers.push(server);
		}
	}

	const onePercentage =  ( loadNumbers.one / loadNumbers.cpus ) * 100;
	const fifteenPercentage = ( loadNumbers.fifteen / loadNumbers.cpus ) * 100;

	// If load levels are very high, take action yourself
	if (onePercentage > (loadThresholds.SCALE_THRESHOLD || 120)
		&& fifteenPercentage > (loadThresholds.SCALE_15_THRESHOLD  || 100)
	) {

		let addTo = loadThresholds.SCALE_INCREMENT;

		if (servers.length >= config.LINODE.SCALE_MAX) {
			alert += `<h3>SERVER CLUSTER AT CAPACITY.</h3>`;
			addTo = 0;
		} else if ( (servers.length + addTo) > config.LINODE.SCALE_MAX) {
			addTo = config.LINODE.SCALE_MAX - servers.length;
		}

		let alert = '';

		if (addTo > 0) {

			alert = `<p>Load levels are over capacity.  Adding another ${loadThresholds.SCALE_INCREMENT} servers for the next few hours</p>`;

			if (loadThresholds?.ENABLED) {

				await db.sequelize.query(`
					delete ts.* from tabroom_setting ts where ts.tag = 'min_servers'
				`, {
					type: db.sequelize.DELETE,
				});

				await db.sequelize.query(`
					insert into tabroom_setting (tag, value, value_date, person)
						values ('min_servers', :numServers, DATE_ADD(now(), INTERVAL 6 HOUR), 2)
				`, {
					type         : db.sequelize.INSERT,
					replacements : {
						numServers: (addTo + servers.length),
					},
				});

				const response = await increaseLinodeCount(user, loadThresholds.SCALE_INCREMENT, true);

				alert += '<code>';
				alert += JSON.stringify(response);
				alert += '</code>';
			} else {
				alert += '<p>Test Run Complete.  Autoscaler not enabled to actually take action.</p>';
			}

		} else {
			alert += '<h4>WARNING: LOAD IS HIGH AND WE ARE AT OUR MACHINE MAXIMUM COUNT. IF YOU ARE NOT PALMER OR HARDY';
			alert += 'GET IN TOUCH WITH ONE OF THEM. IF YOU ARE, SCALE MACHINE TYPES UP OR OMG OMG PANIK PANIK OMG!!!!</h4>';
		}

		if (database.one > 110 || database.fifteen > 100) {
			alert += `<h5>Database server load is also high.  Possible issue there: ${database.one} 1m load, ${database.fifteen} 15m.</h5>`;
			await notifyCloudAdmins(alert, 'AutoScaling UP.  DB Server Load Also High.');
		} else {
			await notifyCloudAdmins(alert, 'AutoScaling UP');
		}
		return;
	}

	// If load levels are high in a sustained manner send out a hey yo shit goin' down

	if (onePercentage > (loadThresholds.ALERT_THRESHOLD || 80)
		&& fifteenPercentage > (loadThresholds.ALERT_15_THRESHOLD  || 60)
	) {
		let alert = `<p>Load levels are approaching capacity</p>`;
		alert += `<p>One minute load average across tabweb machines is ${onePercentage}</p>`;
		alert += `<p>One minute load average across tabweb machines is ${fifteenPercentage}</p>`;

		if (!loadThresholds?.ENABLED) {
			alert += `<h5>Autoscaling is NOT CURRENTLY ENABLED.  System will not scale automatically</h5>`;
		}

		if (database.one > (loadThresholds.ALERT_THRESHOLD || 80)
			&& database.fifteen > (loadThresholds.ALERT_15_THRESHOLD  || 60)
		) {
			alert += `<h5>Database server load is also high.  Possible issue there: ${database.one} 1m load, ${database.fifteen} 15m.</h5>`;
			await notifyCloudAdmins(alert, 'AutoScaling May Be Required.  DB Server Load Also High.');
		} else {
			await notifyCloudAdmins(alert, 'AutoScaling May Be Required');
		}
		return;
	}

	// Check if we are under the estimated count for servers right now.
	if (usageData.serverTarget > servers.length) {
		const needed = usageData.serverTarget - servers.length;
		let alert = `<p>Under forecasted needs. Spinning up ${needed} machines</p>`;

		if (loadThresholds?.ENABLED) {
			const response = await increaseLinodeCount(user, needed, true);
			alert += '<pre>';
			alert += JSON.stringify(response);
			alert += '</pre>';
		} else {
			alert += '<h5>Test Run Complete.  Autoscaler not enabled to actually take action.</h5>';
		}
		await notifyCloudAdmins(alert, 'Scaled Up Based on Anticipated Capacity');
		return;
	}

	// Check if we are over our estimated count.  If we are, check load average
	// first to be sure we're under 20% before shrinking the world.

	if (usageData.serverTarget < servers.length) {

		const needed = servers.length - usageData.serverTarget;
		let alert = `<p>Over forecasted needs. Usage data of ${usageData.totalUsers} requires just ${usageData.serverTarget} machines</p>`;
		alert += `<p>Checking load levels to ensure extra capacity</p>`;

		if (onePercentage < 20 && fifteenPercentage < 30) {
			alert += `<p>Low load confirmed. ${onePercentage.toFixed(2)}% of capacity in active use.</p>`;
			alert += `<p>Destroying ${needed} machines</p>`;
		} else {
			alert += `<p>Load too high to adjust. ${onePercentage.toFixed(2)}% of capacity in active use. 15 minute load is ${fifteenPercentage.toFixed(2)} </p>`;
		}

		if (loadThresholds?.ENABLED) {
			const response = await decreaseLinodeCount(user, needed, true);
			alert += '<pre>';
			alert += JSON.stringify(response, null, 2);
			alert += '</pre>';
		} else {
			alert += '<h5>Test Run Complete.  Autoscaler not enabled to actually take action.</h5>';
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
