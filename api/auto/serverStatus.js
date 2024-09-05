import axios from 'axios';
import db from '../helpers/litedb.js';
import config from '../../config/config.js';

const checkServerDeployments = async () => {

	const servers = await db.sequelize.query(`
		select
			server.id, server.linode_id, server.status,
			server.created_at, server.hostname
		from server
			where server.status NOT IN ('running', 'deploying')
	`, {
		type: db.sequelize.QueryTypes.SELECT,
	});

	for (const server of servers) {

		console.log(`I am testing server ${server.hostname} with status ${server.status}`);
		console.log(`Going to hit ${config.LINODE.API_URL}/instances/${server.linode_id}`);

		const linodeReply = await axios.get(
			`${config.LINODE.API_URL}/instances/${server.linode_id}`,
			{
				headers : {
					Authorization  : `Bearer ${config.LINODE.API_TOKEN}`,
					'Content-Type' : 'application/json',
					Accept         : 'application/json',
				},
			},
		);

		const currentStatus = linodeReply.data;
		console.log(`Current status for ${server.hostname} is ${currentStatus.status}`);

		if (currentStatus.status === 'provisioning'
			&& server.status !== 'provisioning'
		) {

			console.log(`I am updating the query here to set status to provisioning for linode ${server.linode_id}`);

			await db.sequelize.query(`
				update server set status = 'provisioning' where linode_id = :linodeId
			`, {
				replacements : {
					linodeId : server.linode_id,
				},
				type : db.sequelize.QueryTypes.UPDATE,
			});
		}

		if (currentStatus.status === 'running') {

			console.log(`Updating machine with linode ${server.linode_id} to status deploying`);

			await db.sequelize.query(`
				update server set status = 'deploying' where linode_id = :linodeId
			`, {
				replacements : {
					linodeId : server.linode_id,
				},
				type : db.sequelize.QueryTypes.UPDATE,
			});
		}

		console.log(`Finished`);
	}

	return `Server status updated for ${servers.length} machines`;
};

await checkServerDeployments();
db.sequelize.close();
process.exit();
