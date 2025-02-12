import axios from 'axios';
import db from './db.js';
import config from '../../config/config.js';
import notify from './blast.js';

export const getLinodeInstances = async () => {

	const existingMachines = await axios.get(
		`${config.LINODE.API_URL}/instances`,
		{
			headers : {
				Authorization  : `Bearer ${config.LINODE.API_TOKEN}`,
				'Content-Type' : 'application/json',
				Accept         : 'application/json',
			},
		},
	);

	const dbServers = await db.sequelize.query(`select * from server`,
		{ type: db.sequelize.QueryTypes.SELECT }
	);

	const serverByLinodeId = {};

	for (const server of dbServers) {
		serverByLinodeId[server.linode_id] = server;
	}

	const databaseSyncs = [];

	const tabroomMachines = existingMachines.data.data.filter( machine => {

		if (
			machine.tags.includes('control')
			|| machine.tags.includes('haproxy')
			|| machine.tags.includes('tabroom-db')
			|| machine.tags.includes('tabroom-replica')
			|| machine.tags.includes(config.LINODE.WEBHOST_BASE)
		) {
			return machine;
		}
		return null;

	}).map( machine => {

		const status = serverByLinodeId[machine.id]?.status || machine.status;

		if (machine.tags.includes('tabweb') && (!serverByLinodeId[machine.id])) {
			databaseSyncs.push(machine);
		}

		return {
			...machine,
			linode_id : machine.id,
			uuid      : machine.host_uuid,
			ipv4      : machine.ipv4?.[0],
			status,
		};
	});

	if (databaseSyncs.length) {

		const deletionPromises = [];

		databaseSyncs.forEach( (machine) => {
			const promise = db.server.destroy({
				where: { hostname: machine.label },
			});
			deletionPromises.push(promise);
		});

		await Promise.all(deletionPromises);

		const creationPromises = [];

		databaseSyncs.forEach( (machine) => {
			const promise = db.server.create({
				hostname   : machine.label,
				status     : machine.status,
				created_at : new Date(),
				linode_id  : machine.id,
			});

			creationPromises.push(promise);
		});

		await Promise.all(creationPromises);
	}

	const proxyStatus = await getProxyStatus(tabroomMachines);

	tabroomMachines.forEach( (machine) => {

		const proxyData = proxyStatus[machine.label];

		if (proxyData) {
			machine.uptime      = proxyData.uptime;
			machine.mason       = proxyData.mason;
			machine.indexcards  = proxyData.indexcards;
			machine.loadOne     = proxyData['1m_cpu_load'];
			machine.loadFive    = proxyData['5m_cpu_load'];
			machine.loadFifteen = proxyData['15m_cpu_load'];
			machine.mason       = proxyData.mason;
			machine.indexcards  = proxyData.indexcards;

			machine.memory = (proxyData.memory_available / proxyData.memory_total || 1);
			machine.swap = (proxyData.swap_available / proxyData.swap_total || 1);
		}

	});

	return tabroomMachines;

};

export const increaseLinodeCount = async (whodunnit, countNumber) => {

	if (countNumber < 1) {
		return { message: 'You cannot change by zero, silly' };
	}

	const existingMachines = await getLinodeInstances();

	const control = existingMachines.filter(
		machine => machine.tags.includes('control')
	);

	const tabwebs = existingMachines.filter(
		machine => machine.tags.includes(config.LINODE.WEBHOST_BASE)
	);

	const hostnames = tabwebs.map( (machine) => machine.label );
	const target = parseInt(countNumber) || 0;

	if ((target + tabwebs.length) > (config.TABWEB_CAP || 20))  {
		return {
			message: `This process only allows for ${config.TABWEB_CAP || 20} machines to exist at one time.`,
		};
	}

	if (target < 1) {
		return {
			message: `No count target sent; nothing done because I cannot make ${target} machines`,
		};
	}

	// Find the next serial number needed.  Tabweb1 should always exist.
	let serialNumber = 2;

	while (hostnames.includes(`${config.LINODE.WEBHOST_BASE}${serialNumber}`)) {
		serialNumber++;
	}

	const resultMessages = [
		`${whodunnit.name} ${whodunnit.email || 'on the command line'} has INCREASED the tabweb cloud server count by ${target}:\n`,
	];

	const limit = serialNumber + target;
	const promises = [];

	while (serialNumber < limit) {

		const hostname = config.LINODE.WEBHOST_BASE + serialNumber;

		const machineDefinition = {
			booted          : true,
			label           : `${hostname}`,
			type            : config.LINODE.INSTANCE_TYPE,
			region          : config.LINODE.REGION,
			tags            : ['tabweb'],
			has_user_data   : false,
			disk_encryption : 'disabled',
			swap_size       : config.LINODE.SWAP_SIZE,
			image           : config.LINODE.IMAGE,
			private_ip      : false,
			migration_type  : 'warm',
			root_pass       : config.DB_PASS,
			interfaces      : [
				{
					purpose 	: 'public',
				},
				{
					purpose      : 'vlan',
					label        : 'nsda-vlan',
					ipam_address : '10.0.0.1/24',
				},
			],
			depends_on       : [control[0].linode_id],
			stackscript_id   : config.LINODE.STACKSCRIPT_ID,
			stackscript_data : {
				hostname     : `${hostname}`,
			},
		};

		try {

			const creationReply = axios.post(
				`${config.LINODE.API_URL}/instances`,
				machineDefinition,
				{
					headers : {
						Authorization  : `Bearer ${config.LINODE.API_TOKEN}`,
						'Content-Type' : 'application/json',
						Accept         : 'application/json',
					},
				},
			);

			promises.push(creationReply);

		} catch (err) {

			console.log(`Error returned by creation request: ${JSON.stringify(err)} `);

			return {
				message: `Machine creation ${hostname} failed with response code ${err.response?.status} ${err.response?.statusText} and errors`,
			};
		}
		serialNumber++;
	}

	const replies = await Promise.all(promises);

	for (const creationReply of replies) {

		if (parseInt(creationReply.status) === 200) {

			const data = creationReply.data;

			await db.server.create({
				hostname   : data.label,
				status     : 'provisioning',
				created_at : new Date(),
				linode_id  : data.id,
			});

			resultMessages.push('');
			resultMessages.push(`Machine ${data.label} creation request successful.\n`);
			resultMessages.push(`IPv4 ${data.ipv4[0]} IPv6 ${data.ipv6}\n`);
			resultMessages.push(`Linode ID ${data.id} UUID ${data.host_uuid}\n`);
			resultMessages.push(`Machine now queued for ansible deployment\n`);
		}
	}

	await db.changeLog.create({
		person     : whodunnit.id || 1,
		tag        : 'sitewide',
		created_at : new Date(),
		description: resultMessages.join('\n'),
	});

	const emailResponse = await notifyCloudAdmins(whodunnit, resultMessages.join('<br />'), `${target} Machines Added`);

	const response = {
		emailResponse,
		message : resultMessages.join('<br />'),
	};

	return response;

};

export const decreaseLinodeCount = async (whodunnit, countNumber) => {

	if (countNumber < 1) {
		return { message: 'You cannot change by zero, silly' };
	}

	const existingMachines = await getLinodeInstances();

	const tabwebs = existingMachines.filter(
		machine => machine.tags.includes(config.LINODE.WEBHOST_BASE)
	);

	const hostnames = tabwebs.map( (machine) => machine.label );
	const target = parseInt(countNumber) || 0;

	let serialNumber = (hostnames.length - target) + 1;

	if (serialNumber < 3) {
		let reply = `You may only shrink the Tabroom instance footprint to a minimum of 2 machines.`;
		reply += `Deleting ${target} would leave me with ${hostnames.length - target}.`;
		return { message: reply };
	}

	const resultMessages = [
		`${whodunnit.name} ${whodunnit.email || 'on the command line'} has DECREASED the tabweb cloud server count by ${target}:\n`,
	];

	const destroyMe = [];

	while (hostnames.includes(`${config.LINODE.WEBHOST_BASE}${serialNumber}`)) {

		const hostname = `${config.LINODE.WEBHOST_BASE}${serialNumber}`;

		const matches = tabwebs.filter(
			host => host.label === hostname
		);

		if (matches) {

			const machine = matches[0];

			try {
				const deletionReply = await axios.delete(
					`${config.LINODE.API_URL}/instances/${machine.linode_id}`,
					{
						headers : {
							Authorization  : `Bearer ${config.LINODE.API_TOKEN}`,
							'Content-Type' : 'application/json',
							Accept         : 'application/json',
						},
					},
				);

				if (parseInt(deletionReply.status) === 200) {
					resultMessages.push('');
					resultMessages.push(`Machine ${hostname} deletion request successful.<br />`);
					resultMessages.push(`Linode ID ${machine.linode_id}. UUID ${machine.uuid} terminating<br />`);
					resultMessages.push(`${JSON.stringify(deletionReply.data)} <br />`);

					destroyMe.push(hostname);

					await db.sequelize.query(`delete from server where linode_id = :linodeId`,
						{
							replacements: { linodeId: machine.linode_id },
							type: db.sequelize.QueryTypes.DELETE,
						}
					);
				}

			} catch (err) {

				return {
					message: `Deleting ${hostname} failed with response code ${err.response.status} ${err.response.statusText} and errors ${err.response?.data?.errors}`,
				};
			}
		}
		serialNumber++;
	}

	await db.changeLog.create({
		person     : whodunnit.id || 1,
		tag        : 'sitewide',
		created_at : new Date(),
		description: resultMessages.join('\n'),
	});

	const emailResponse = await notifyCloudAdmins(whodunnit, resultMessages.join(), `${target} Machines Removed`);

	const response = {
		delete  : destroyMe,
		message : resultMessages.join('<br />'),
		emailResponse,
	};

	return response;
};

export const notifyCloudAdmins = async (whodunnit, log, subject) => {

	const cloudAdmins = await db.sequelize.query(`
		select distinct person.id
			from person, person_setting ps
		where person.id = ps.person
			and ps.tag = :tag
	`, {
		replacements: { tag: 'system_administrator' },
		type: db.sequelize.QueryTypes.SELECT,
	});

	let sender = {};

	if (whodunnit.su) {
		sender = await db.summon(db.person, whodunnit.su);
	} else if (whodunnit.id) {
		sender = await db.summon(db.person, whodunnit.id);
	} else if (whodunnit.username === 'palmer') {
		sender = await db.summon(db.person, 1);
	} else if (whodunnit.username === 'hardy') {
		sender = await db.summon(db.person, 3);
	} else {
		sender = await db.summon(db.person, 2);
	}

	const adminIds = cloudAdmins.map( item => item.id );

	const message = {
		ids     : adminIds,
		text    : log,
		from    : `${sender.first} ${sender.last} <${sender.email}>`,
		subject : `Tabroom Cloud Change: ${subject}`,
	};

	const emailResponse = await notify(message);
	return emailResponse;
};

export const getProxyStatus = async(existingMachines) => {

	const allStatus = {};
	let checkMachines = [];

	if (existingMachines && existingMachines.length > 0) {
		checkMachines = existingMachines;
	} else {
		checkMachines = await getLinodeInstances();
	}

	const tabwebs = checkMachines.filter(
		machine => machine.label.includes(config.LINODE.WEBHOST_BASE)
	);

	allStatus.tabwebCount = tabwebs.length;

	let haproxyData = {};
	const haproxyKey = {};
	const parsedProxyData = {};

	try {
		haproxyData = await axios.get(
			`http://haproxy.${config.INTERNAL_DOMAIN}:9000/;json`,
		);
	} catch (err) {
		return `Could not connect to HAProxy.  Try again later. ${err}`;
	}

	// HAproxy's export format is so convoluted I swear Jon Bruschke designed
	// it. Parse it down to a key value store organized by host that an actual
	// human might find useful.

	for (const proxy of haproxyData.data) {

		for (const row of proxy) {

			if (row.id > 0 && row.value?.value && row.field?.name) {

				const rowId = `${row.proxyId}-${row.id}`;

				if (typeof parsedProxyData[rowId] === 'undefined') {
					parsedProxyData[rowId] = {
						rowId,
					};
				}

				parsedProxyData[rowId][row.field.name] = row.value.value;

				if (row.field?.name === 'svname') {
					haproxyKey[row.value.value] = rowId;
				}
			}
		}
	}

	const metrics = [];

	checkMachines.forEach( (machine) => {
		const metric = axios.get(
			`http://${machine.label}.${config.INTERNAL_DOMAIN}:9100/metrics`,
		);
		metrics.push(metric);
	});

	let resolvedMetrics = [];

	try {
		resolvedMetrics = await Promise.all(metrics);
	} catch (err) {
		return { message: `Not all machines could be connected to.  Try again in a bit. ${err}` };
	}
	const metricsByMachine = {};

	resolvedMetrics.forEach( (metric) => {
		// Whoever designed this API without an easy hostname key should be set on fire
		const outputArray = metric.data.split('\n');
		const hostnameValues = outputArray.filter( line => line.includes('node_uname_info'));

		const splitHost = hostnameValues[2].split(/,/);
		const hostname = splitHost[2].replace(/nodename=/g, '').replace(/"/g, '');

		const filteredOutput = outputArray.filter( line => !line.includes(`#`) );
		metricsByMachine[hostname] = filteredOutput;
	});

	const loadValues = {
		node_load1                     : '1m_cpu_load',
		node_load5                     : '5m_cpu_load',
		node_load15                    : '15m_cpu_load',
		node_memory_MemTotal_bytes     : 'memory_total',
		node_memory_MemAvailable_bytes : 'memory_available',
		node_memory_SwapTotal_bytes    : 'swap_total',
		node_memory_SwapFree_bytes     : 'swap_available',
		node_time_seconds              : 'current_time',
		node_boot_time_seconds         : 'last_boot_time',
	};

	for (const machine of checkMachines) {

		const outputArray = metricsByMachine[machine.label];
		const machineStatus = {};

		for (const key of Object.keys(loadValues)) {

			const endValues = outputArray.filter( line => line.includes(`${key} `));
			const splitme = endValues[0].split(/(\s+)/);
			machineStatus[loadValues[key]] = Number(splitme[2]);

			if (key.includes('memory')) {
				machineStatus[loadValues[key]] = Number(splitme[2]) / 1024 / 1024 / 1024;
			} else {
				machineStatus[loadValues[key]] = Number(splitme[2]);
			}
		}

		machineStatus.uptime = (
			parseFloat(machineStatus.current_time) - parseFloat(machineStatus.last_boot_time)
		) / 60 / 60 / 24;

		// Figure out the HAProxy round robin status of the expected containers on this machine

		if (machine.label.includes('tabweb')) {

			const machineNumber = machine.label.replace(/\D/g,'');

			for  (const tick of [1,2,3,4]) {

				const masonHost = `mason${machineNumber}${tick}`;
				const masonId = haproxyKey[masonHost];

				if (!machineStatus.mason) {
					// The day may come when I iterate this properly.  BUT IT IS NOT THIS DAY.
					machineStatus.mason = {
						1: {},
						2: {},
						3: {},
						4: {},
					};
				}

				machineStatus.mason[tick] = {
					id          : masonId,
					status      : parsedProxyData[masonId]?.status,
					checkStatus : parsedProxyData[masonId]?.check_status,
					checkCode   : parsedProxyData[masonId]?.check_code,
					downtime    : parsedProxyData[masonId]?.downtime || 0,
				};

				const indexcardsHost = `indexcards${machineNumber}${tick}`;
				const indexcardsId = haproxyKey[indexcardsHost];

				if (!machineStatus.indexcards) {
					// The day may come when I iterate this properly.  BUT IT IS NOT THIS DAY.
					machineStatus.indexcards = {
						1: {},
						2: {},
						3: {},
						4: {},
					};
				}

				machineStatus.indexcards[tick] = {
					id          : indexcardsId,
					status      : parsedProxyData[indexcardsId]?.status,
					checkStatus : parsedProxyData[masonId]?.check_status,
					checkCode   : parsedProxyData[masonId]?.check_code,
					downtime    : parsedProxyData[masonId]?.downtime || 0,
				};
			}
		}

		allStatus[machine.label] = machineStatus;
	}

	return allStatus;
};
