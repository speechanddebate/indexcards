import db from '../helpers/litedb.js';
import { syncLearnByCourse } from '../helpers/nsda.js';

const syncAllLearn = async () => {

	const courses = await db.sequelize.query(`
		select quiz.id, quiz.tag, quiz.label, quiz.nsda_course
			from quiz
		where 1=1
			and quiz.nsda_course IS NOT NULL
			and quiz.nsda_course != 0
	`, {
		type: db.Sequelize.QueryTypes.SELECT,
	});

	const promises = [];

	courses.forEach( (course) => {
		const promise = syncLearnByCourse(course);
		promises.push(promise);
	});

	await Promise.all(promises);

	promises.forEach( (promise) => {
		console.log(promise);
	});
	console.log(`${courses.length} courses synchronized `);
};

await syncAllLearn();
process.exit();
