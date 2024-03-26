import db from '../helpers/litedb.js';

export const clearShareRooms = async () => {

	await db.sequelize.query(`
		delete
			ps.*
		from panel_setting ps, panel, round, event, tourn
		where tourn.end < NOW() - INTERVAL 30 DAY
			and tourn.id = event.tourn
			and event.id = round.event
			and round.id = panel.round
			and panel.id = ps.panel
			and ps.tag = 'share'
	`, {
		type : db.sequelize.QueryTypes.DELETE,
	});

	return 'Legacy share rooms deleted';
};

await clearShareRooms();
process.exit();

export default clearShareRooms;
