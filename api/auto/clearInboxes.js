import db from '../helpers/litedb.js';

export const clearInboxes = async () => {

	await db.sequelize.query(`
		delete
			message.*
		from message, tourn
		where message.tourn = tourn.id
			and tourn.end < (CURRENT_DATE - INTERVAL 10 DAY)
	`, {
		type : db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete
			message.*
		from message
		where message.created_at < (CURRENT_DATE - INTERVAL 20 DAY)
		and (message.tourn IS NULL or message.tourn = 0)
	`, {
		type : db.sequelize.QueryTypes.DELETE,
	});
};

await clearInboxes();
process.exit();

export default clearInboxes;
