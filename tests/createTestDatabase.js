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
		DELETE
			FROM chapter WHERE 1=1
			AND NOT EXISTS (select school.id from school where school.chapter = chapter.id LIMIT 1)
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		DELETE
			FROM student
			WHERE 1=1
			AND NOT EXISTS (select chapter.id from chapter where chapter.id = student.chapter);
	`, {
		type: db.sequelize.QueryTypes.DELETE,
	});

	await db.sequelize.query(`
		DELETE
			FROM student
			WHERE 1=1
			AND retired = 1
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
};

await pruneDatabase();

console.log(`Pruned database created in ${config.DB_DATABASE}`);

process.exit();
