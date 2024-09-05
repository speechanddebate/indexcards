import axios from 'axios';
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

export const getInstanceStatus = {

	GET: async (req, res) => {

		req.returnToSender = true;
		const existingMachines = await getInstances.GET(req, res);

		const allStatus = {};

		for (const machine of existingMachines) {

			const loadValues = {
				node_load1                     : '1m_cpu_load',
				node_load5                     : '5m_cpu_load',
				node_load15                    : '15m_cpu_load',
				node_memory_MemTotal_bytes     : 'memory_total',
				node_memory_MemAvailable_bytes : 'memory_available',
				node_memory_SwapTotal_bytes    : 'swap_total',
				node_memory_SwapFree_bytes     : 'swap_available',
			};

			try {

				const outputText = await axios.get(
					`http://${machine.label}.${config.INTERNAL_DOMAIN}:9100/metrics`,
				);

				// const haproxyData = await axios.get(
				// 	`http://haproxy.${config.INTERNAL_DOMAIN}:9000;json`,
				// );

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

				allStatus[machine.label] = machineStatus;

			} catch (err) {
				errorLogger.info(`The Prometheus scanner done messed up and returned`);
				errorLogger.info(err.name);
				errorLogger.info(err.code);
				errorLogger.info(err.message);
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

		return res.status(200).json(linodeData.data);
	},
};

export const changeInstanceCount = {

	GET: async (req, res) => {

		req.returnToSender = true;

		const existingMachines = await getInstances.GET(req, res);

		const control = existingMachines.filter(
			machine => machine.tags.includes('control')
		);

		const tabwebs = existingMachines.filter(
			machine => machine.tags.includes(config.LINODE.WEBHOST_BASE)
		);

		const hostnames = tabwebs.map( (machine) => machine.label );

		const target = parseInt(req.params.target) || 0;

		if (target > 8) {
			return res.status(401).json(`This process only allows the creation of 8 machines at one time.`);
		}

		if (target < 1) {
			return res.status(401).json(`No count target sent; nothing done because I cannot make ${target} machines`);
		}

		// Find the next serial number needed.  Tabweb1 should always exist.
		let serialNumber = 2;

		while (hostnames.includes(`${config.LINODE.WEBHOST_BASE}${serialNumber}`)) {
			serialNumber++;
		}

		const resultMessages = [];
		const limit = serialNumber + target;
		console.log(`Serial number is ${serialNumber}.  Target ${target}.  Limit is therefore ${limit}!`);
		console.log(`Control ID is ${control[0].linode_id}`);

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

					await req.db.server.create({
						hostname,
						status     : 'provisioning',
						created_at : new Date(),
						linode_id  : data.id,
					});

					const data = creationReply.data;
					resultMessages.push('');
					resultMessages.push(`Machine ${hostname} creation request successful.`);
					resultMessages.push(`Label ${data.label} IPv4 ${data.ipv4[0]} IPv6 ${data.ipv6}`);
					resultMessages.push(`Linode ID ${data.id} UUID ${data.host_uuid}`);
					resultMessages.push(`Machine now queued for ansible deployment`);
				}

			} catch (err) {
				console.log(`Machine creation ${hostname} failed with response code ${err.response?.status} ${err.response?.statusText} and errors`);
				console.log(err.response?.data?.errors);
				console.log(err.response);
			}

			serialNumber++;
		}

		return res.status(200).json(resultMessages);
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
			return res.status(401).json(reply);
		}

		const resultMessages = [];

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
						resultMessages.push(`Machine ${hostname} deletion request successful.`);
						resultMessages.push(`Linode ID ${machine.linode_id} UUID ${machine.uuid} terminating`);
						resultMessages.push(deletionReply.data);

						await req.db.sequelize.query(`delete from server where linode_id = :linodeId`,
							{
								replacements: { linodeId: machine.linode_id },
								type: req.db.sequelize.QueryTypes.DELETE,
							}
						);
					}

				} catch (err) {
					console.log(`Deleting ${hostname} failed with response code ${err.response.status}
						${err.response.statusText} and errors: `);
					console.log(err.response?.data?.errors);
				}
			}

			serialNumber++;
		}

		return res.status(200).json(resultMessages);
	},

};

export default getInstances;
