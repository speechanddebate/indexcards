import db from '../api/helpers/litedb.js';
import config from '../config/config.js';

const pruneDatabase = async () => {

	const keeperTourns = [
		26661, // NSDA Nationals
		31059, // NCFL Grand Nationals
		30661, // Mock Trial Nationals
		27074, // Cal Berkeley
		29774, // Texas Open
		29595, // CHSSA State (composite ranks)
		30371, // Dartmouth Round Robin (includes bye)
		29714, // New England District (single elimination)
		29807, // Rushmore District (double elimination)
		24674, // Share Test tournament with some billing nonsense
	];

	const keeperEvents = [
		244135,244137,244138,244140,244141,244146,244150,244156,248095,248096,248097,
		248101,248106,274437,273242,273250,273251,273255,273257,273258,274615,274616,
		274619,274623,274624,274626,274628,275386,275387,275389,275933,275934,275943,
		291000,291003,291004,282898,286196,289814,289815,289816,289819,289821,
	];

	await db.sequelize.query(`
		delete from tourn where id NOT IN (:keeperTourns)
	`, {
		replacements: {
			keeperTourns,
		},
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from event where id NOT IN (:keeperEvents)
	`, {
		replacements: {
			keeperEvents,
		},
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		DELETE
			FROM chapter WHERE 1=1
			AND NOT EXISTS (select school.id from school where school.chapter = chapter.id LIMIT 1)
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		DELETE FROM student
		where 1=1
		AND not exists ( select es.id from entry_student es where es.student = student.id);
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete
		from chapter_judge
		where 1=1
		and not exists (select judge.id from judge where judge.chapter_judge = chapter_judge.id);
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		DELETE
			FROM person
		WHERE 1=1
			AND NOT EXISTS (select student.id from student where student.person = person.id)
			AND NOT EXISTS (select judge.id from judge where judge.person = person.id)
			AND NOT EXISTS (select permission.id from permission,tourn where permission.person = person.id and permission.tourn = tourn.id)
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from change_log;
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		delete from site where not exists (select ts.id from tourn_site ts where ts.site = site.id);
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});
	await db.sequelize.query(`
		delete from room where not exists (select site.id from site where site.id = room.site);
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});
	await db.sequelize.query(`
		delete from person_setting where tag = "paradigm"
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});
	await db.sequelize.query(`
		delete from score where tag IN ('rfd', 'comment')
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});
};

await pruneDatabase();

console.log(`Pruned database created in ${config.DB_DATABASE}`);

process.exit();
