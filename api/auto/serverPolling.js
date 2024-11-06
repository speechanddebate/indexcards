import axios from 'axios';
import db from '../helpers/litedb.js';
import config from '../../config/config.js';

const checkServerExistence = async () => {

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

	const activeMachines = [];

	for (const machine of existingMachines.data.data) {
		if (machine.tags.includes(config.LINODE.WEBHOST_BASE)) {
			activeMachines.push(machine.id);
		}
	}

	if (activeMachines.length > 1) {
		await db.sequelize.query(`
			delete from server where linode_id NOT IN (:activeMachines)
		`, {
			replacements : { activeMachines },
			type : db.sequelize.QueryTypes.DELETE,
		});
	}

	return `Server existence checked. ${activeMachines.length} actually exist.`;
};

await checkServerExistence();
db.sequelize.close();
process.exit();
