import db from '../api/helpers/db';
import config from '../config/config.js';
import testData from './testFixtures';

export const setup = async () => {

	const tourncount = await db.sequelize.query(
		`select count(id) as count from tourn`,
		{ type: db.sequelize.QueryTypes.SELECT },
	);

	if (tourncount?.[0]?.count === 10) {

		const firstPromises = [];

		firstPromises.push(db.sequelize.query( `delete from session where person > 3 and person < 100 ` ));
		firstPromises.push(db.sequelize.query( `delete from campus_log where id < 100`));
		firstPromises.push(db.sequelize.query( `delete from campus_log where person > 3 and person < 100` ));
		firstPromises.push(db.sequelize.query( `delete from person where id > 3 and id < 100` ));

		await Promise.all(firstPromises);

		const secondPromises = [];

		secondPromises.push(db.person.create(testData.testUser));
		secondPromises.push(db.person.create(testData.testAdmin));
		secondPromises.push(db.ad.create(testData.testAd));

		await Promise.all(secondPromises);

		const thirdPromises = [];

		thirdPromises.push(db.session.create(testData.testUserSession));
		thirdPromises.push(db.permission.create(testData.testUserTournPerm));
		thirdPromises.push(db.session.create(testData.testAdminSession));
		thirdPromises.push(db.person.bulkCreate(testData.testCampusUsers));
		thirdPromises.push(db.personSetting.create(testData.testUserAPIKey));
		thirdPromises.push(db.personSetting.bulkCreate(testData.testUserAPIPerms));

		await Promise.all(thirdPromises);

		console.log(`Test data properly loaded and ready to run`);
		return;
	}

	console.log(`Database ${config.DB_DATABASE} is not loaded with the proper test data `);
	console.log(`Test data should live in a separate database connected via the ${config.MODE} env `);
	console.log(`and loaded from /indexcards/test/test.sql.  Yes this is a lazy way to do it, but `);
	console.log(`until Tabroom has six developers working with me, that's how it's gonna be.`);
	console.log(``);

	console.log(`I expected 10 tournaments and found ${tourncount?.[0]?.count}`);

	console.log(``);
	console.log(`Someday I might automate this but node and command line shells don't play well together.`);
	console.log(``);

	throw new Error('No test data found');
};

export const teardown = async () => {

	console.log(`Cleanup commencing`);

	await db.sequelize.query( `delete from session where person > 3 and person < 100 ` );
	await db.sequelize.query( `delete from campus_log where id < 100`);
	await db.sequelize.query( `delete from campus_log where person > 3 and person < 100` );
	await db.sequelize.query( `delete from person where id > 3 and id < 100` );
	await db.sequelize.query( `delete from ad where id < 2 `);

	console.log(`Cleanup done`);
};
