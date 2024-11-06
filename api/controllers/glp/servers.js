import axios from 'axios';
import notify from '../../helpers/blast.js';
import config from '../../../config/config.js';
import { errorLogger } from '../../helpers/logger.js';

export const getInstances = {

	GET: async (req, res) => {

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
			return {
				linode_id : machine.id,
				uuid      : machine.host_uuid,
				label     : machine.label,
				tags      : machine.tags,
				status    : machine.status,
				created   : machine.created,
				updated   : machine.updated,
				region    : machine.region,
				type      : machine.type,
				ipv4      : machine.ipv4?.[0],
				ipv6      : machine.ipv6,
			};
		});

		if (req.returnToSender) {
			return tabroomMachines;
		}

		return res.status(200).json(tabroomMachines);
	},
};

export const getTabroomUsage = {

	GET: async (req, res) => {

		const allStudents = await req.db.sequelize.query(`
			select
				count (distinct student.person)
			from student, entry_student es, entry, event, tourn
			where tourn.start < DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY)
				and tourn.end > NOW()
				and tourn.id = event.tourn
				and tourn.hidden != 1
				and event.id = entry.event
				and entry.active = 1
				and entry.id = es.entry
				and es.student = student.id
			group by student.id
		`, {
			type: req.db.sequelize.QueryTypes.SELECT,
		});

		const allJudges = await req.db.sequelize.query(`
			select
				count (distinct judge.person)
			from judge, category, tourn
			where tourn.start < DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY)
				and tourn.end > CURRENT_TIMESTAMP
				and tourn.id = category.tourn
				and tourn.hidden != 1
				and category.id = judge.category
			group by judge.id
		`, {
			type: req.db.sequelize.QueryTypes.SELECT,
		});

		const tournamentCount = await req.db.sequelize.query(`
			select
				count (tourn.id)
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
			group by tourn.id
		`, {
			type: req.db.sequelize.QueryTypes.SELECT,
		});

		const currentActiveUsers = await req.db.sequelize.query(`
			select
				count (distinct session.id)
			from session
				where session.last_access > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY)
			group by session.id
		`, {
			type: req.db.sequelize.QueryTypes.SELECT,
		});

		return res.status(200).json({
			activeUsers : currentActiveUsers.length,
			tournaments : tournamentCount.length,
			judges      : allJudges.length,
			students    : allStudents.length,
		});
	},
};

export const getInstanceStatus = {

	GET: async (req, res) => {

		req.returnToSender = true;
		const existingMachines = await getInstances.GET(req, res);

		const allStatus = {};

		const tabwebs = existingMachines.filter(
			machine => machine.tags.includes(config.LINODE.WEBHOST_BASE)
		);

		allStatus.tabwebCount = tabwebs.length;

		let haproxyData = {};
		const haproxyKey = {};

		try {
			haproxyData = await axios.get(
				`http://haproxy.${config.INTERNAL_DOMAIN}:9000/;json`,
			);
		} catch (err) {
			errorLogger.error(err);
			return;
		}

		const parsedProxyData = {};

		// HAproxy's export format is so convoluted I swear Jon Bruschke designed it.
		// Parse it down to a key value store organized by host that an actual human might find useful.

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

		for (const machine of existingMachines) {

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

			try {

				const outputText = await axios.get(
					`http://${machine.label}.${config.INTERNAL_DOMAIN}:9100/metrics`,
				);

				const outputArray = outputText.data.split('\n');
				const filteredOutput = outputArray.filter( line => !line.includes(`#`) );
				const machineStatus = {};

				for (const key of Object.keys(loadValues)) {

					const endValues = filteredOutput.filter( line => line.includes(`${key} `));
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

				if (machine.tags.includes('tabweb')) {

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

			} catch (err) {
				errorLogger.error(`Status error returned ${err.message} ${err.code} on machine ${err.name}`);
			}
		}
		return res.status(200).json(allStatus);
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

		req.returnToSender = true;

		const existingMachines = await getInstances.GET(req, res);

		const control = existingMachines.filter(
			machine => machine.tags.includes('control')
		);

		const tabwebs = existingMachines.filter(
			machine => machine.tags.includes(config.LINODE.WEBHOST_BASE)
		);

		const hostnames = tabwebs.map( (machine) => machine.label );

		const target = parseInt(req.params.target) || parseInt(req.body.target) || 0;

		if ((target + tabwebs.length) > 16)  {
			return res.status(401).json({
				message: `This process only allows for 16 machines to exist at one time.`,
			});
		}

		if (target < 1) {
			return res.status(401).json({
				message: `No count target sent; nothing done because I cannot make ${target} machines`,
			});
		}

		// Find the next serial number needed.  Tabweb1 should always exist.
		let serialNumber = 2;

		while (hostnames.includes(`${config.LINODE.WEBHOST_BASE}${serialNumber}`)) {
			serialNumber++;
		}

		const resultMessages = [];
		const limit = serialNumber + target;

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

				const creationReply = await axios.post(
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

				if (parseInt(creationReply.status) === 200) {

					const data = creationReply.data;

					await req.db.server.create({
						hostname,
						status     : 'provisioning',
						created_at : new Date(),
						linode_id  : data.id,
					});

					resultMessages.push('');
					resultMessages.push(`Machine ${hostname} creation request successful.\n`);
					resultMessages.push(`Label ${data.label} IPv4 ${data.ipv4[0]} IPv6 ${data.ipv6}\n`);
					resultMessages.push(`Linode ID ${data.id} UUID ${data.host_uuid}\n`);
					resultMessages.push(`Machine now queued for ansible deployment\n`);
				}

			} catch (err) {
				return res.status(401).json({
					message: `Machine creation ${hostname} failed with response code ${err.response?.status} ${err.response?.statusText} and errors`,
				});
			}
			serialNumber++;
		}

		await req.db.changeLog.create({
			person     : req.session.su || req.session.person,
			tag        : 'sitewide',
			created_at : new Date(),
			description: resultMessages.join(),
		});

		const emailResponse = await notifyCloudAdmins(req, resultMessages.join(), `${target} Machines Added`);

		const response = {
			emailResponse,
			message : resultMessages.join(),
		};

		return res.status(200).json(response);
	},

	DELETE: async (req, res) => {

		req.returnToSender = true;
		const existingMachines = await getInstances.GET(req, res);

		const tabwebs = existingMachines.filter(
			machine => machine.tags.includes(config.LINODE.WEBHOST_BASE)
		);

		const hostnames = tabwebs.map( (machine) => machine.label );
		const target = parseInt(req.params.target) || 1;

		let serialNumber = (hostnames.length - target) + 1;

		if (serialNumber < 3) {
			let reply = `You may only shrink the Tabroom instance footprint to a minimum of 2 machines.`;
			reply += `Deleting ${target} would leave me with ${hostnames.length - target}.`;
			return res.status(401).json({
				message: reply,
			});
		}

		const resultMessages = [
			`${req.session.person.first} ${req.session.person.last} has initiated a cloud services change:`,
			'\n',
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
						resultMessages.push(`Machine ${hostname} deletion request successful.\n`);
						resultMessages.push(`Linode ID ${machine.linode_id} UUID ${machine.uuid} terminating\n`);
						resultMessages.push(deletionReply.data);

						destroyMe.push(hostname);

						await req.db.sequelize.query(`delete from server where linode_id = :linodeId`,
							{
								replacements: { linodeId: machine.linode_id },
								type: req.db.sequelize.QueryTypes.DELETE,
							}
						);
					}

				} catch (err) {

					return res.status(401).json({
						message: `Deleting ${hostname} failed with response code ${err.response.status} ${err.response.statusText} and errors ${err.response?.data?.errors}`,
					});
				}
			}
			serialNumber++;
		}

		await req.db.changeLog.create({
			person     : req.session.su || req.session.person,
			tag        : 'sitewide',
			created_at : new Date(),
			description: resultMessages.join(),
		});

		const emailResponse = await notifyCloudAdmins(req, resultMessages.join(), `${target} Machines Removed`);

		const response = {
			delete : destroyMe,
			emailResponse,
			message: resultMessages.join(),
		};

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

		const resultMessages = [];

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
			description: resultMessages.join(),
		});

		await notifyCloudAdmins(req, resultMessages.join(), `${machine.label} Rebooted`);

		return res.status(200).json({
			message: resultMessages.join(),
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
		text    : log,
		from    : `${sender.first} ${sender.last} <${sender.email}>`,
		subject : `Tabroom Cloud Change: ${subject}`,
	};

	const emailResponse = await notify(message);
	return emailResponse;
};

export default getInstances;
