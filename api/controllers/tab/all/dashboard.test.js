import request from 'supertest';
import { assert } from 'chai';
import config from '../../../../config/config';
import db from '../../../helpers/db';
import server from '../../../../app';
import userData from '../../../../tests/testFixtures';

const testUserSession = await db.session.findByPk(userData.testUserSession.id);

const testTourn = {
	id     : 27074,
	name   : 'Cal Berkeley Invitational',
	round  : 1150315,
	panel  : 7212079,
	entry  : 5141238,
	person : 8157,
	judge  : 2143673,
};

describe('Status Board', () => {

	beforeAll(async () => {

		const permission = {
			person : testUserSession.person,
			tourn  : testTourn.id,
			tag    : 'tabber',
		};

		await db.permission.create(permission);

		const campusLogs = [
			{ 	tag         : 'present',
				description : 'LASA marked as present by testrunner',
				entry       : testTourn.entry,
				marker      : testUserSession.person || 69,
				tourn       : testTourn.id,
				panel       : testTourn.panel,
			},
			{ 	tag         : 'present',
				description : 'Cayman marked as present by testrunner',
				person      : testTourn.person,
				marker      : testUserSession.person || 69,
				tourn       : testTourn.id,
				panel       : testTourn.panel,
			},
		];

		await db.campusLog.bulkCreate(campusLogs);

	});

	it('Return a correct JSON status object', async () => {

		const res = await request(server)
			.get(`/v1/tab/${testTourn.id}/round/${testTourn.round}/attendance`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${testUserSession.userkey}`])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isObject(res.body, 'Response is an object');

		assert.equal(
			res.body.person[testTourn.person][testTourn.panel].tag,
			'present',
			'Judge Giordano marked present by an admin'
		);

		assert.equal(
			res.body.entry[testTourn.entry][testTourn.panel].tag,
			'present',
			'LASA marked present by an admin'
		);

		assert.equal(
			res.body.entry[testTourn.entry][testTourn.panel].markerId,
			'69',
			'LASA marked present by the correct admin'
		);

	});

	it('Reflects absence & presence changes in a new status object', async() => {

		// Mark Cayman as absent
		await request(server)
			.post(`/v1/tab/${testTourn.id}/all/attendance`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${testUserSession.userkey}`])
			.send({
				targetId : testTourn.person,   	// person who was absent now present
				panel    : testTourn.panel, 	// panel ID
				present  : 0,
			})
			.expect('Content-Type', /json/)
			.expect(201);

		// Mark LASA as absent
		await request(server)
			.post(`/v1/tab/${testTourn.id}/all/attendance`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${testUserSession.userkey}`])
			.send({
				targetId   : testTourn.entry,
				panel      : testTourn.panel,
				targetType : `entry`,
				present    : 0,
			})
			.expect('Content-Type', /json/)
			.expect(201);

		// Mark Ediger ballot as started
		await request(server)
			.post(`/v1/tab/${testTourn.id}/all/attendance`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${testUserSession.userkey}`])
			.send({
				targetId      : testTourn.judge,
				panel         : 7212078,
				targetType    : `judge`,
				setting_name  : `judge_started`,
				property_name : 0,
			})
			.expect('Content-Type', /json/)
			.expect(201);

		const newResponse = await request(server)
			.get(`/v1/tab/${testTourn.id}/round/${testTourn.round}/attendance`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${testUserSession.userkey}`])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isObject(newResponse.body, 'Response is indeed an object');
		const newBody = newResponse.body;

		assert.equal(
			newBody.person[testTourn.person][testTourn.panel].tag,
			'present',
			'After the change posted, Judge Giordano marked absent by an admin'
		);

		assert.equal(
			newBody.entry[testTourn.entry][testTourn.panel].tag,
			'present',
			'LASA marked present by an admin'
		);

		assert.equal(
			newBody.entry[testTourn.entry][testTourn.panel].markerId,
			'69',
			'LASA marked present by the correct admin'
		);
	});

	afterAll(async () => {

		await db.sequelize.query(`delete from campus_log where marker = 69`,
			{ type: db.sequelize.QueryTypes.DELETE }
		);
	});

});

describe.skip('Event Dashboard', () => {
	it('Return a correct JSON status object for the event dashboard', async () => {
		const res = await request(server)
			.get(`/v1/tab/${testTourn.id}/status/dashboard`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${userData.testUserSession.userkey}`])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isObject(res.body, 'Response is an object');

		assert.equal(
			res.body[7].abbr,
			'LD',
			'Event 7 is LD');
		assert.equal(
			res.body[7].rounds[1][1].unstarted,
			'25',
			'15 unstarted in Round 1 flight 1');

		assert.isTrue(
			res.body[7].rounds[1][2].undone,
			'Flight 2 is not done');
	});
});
