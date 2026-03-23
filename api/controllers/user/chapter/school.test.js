import { assert } from 'chai';
import request from 'supertest';
import server from '../../../../app';

import db from '../../../data/db';
import factories from '../../../../tests/factories';
import config from '../../../../config/config';

import {
	testUserChapterPerm,
	testUserSchoolContact,
} from '../../../../tests/testFixtures';

describe ('getMySchoolsByTourn', () => {
	let userkey, personId;
	beforeEach(async () => {
		const session = await factories.session.createTestSession();
		userkey = session.userkey;
		personId = session.personId;
		await factories.permission.createTestPermission({
			chapterId : 130737,
			schoolId  : 699354,
			tournId   : 31059,
			personId  : personId,
			tag     : 'chapter',
		});
		await db.contact.create({
			school   : 694009,
			tourn    : 30661,
			chapter  : 130140,
			person   : personId,
			official : 1,
			onsite   : 1,
			email    : 1,
		});
		await db.permission.upsert(testUserChapterPerm);
		await db.contact.create(testUserSchoolContact);
	});
	afterEach(async () => {
		await db.sequelize.query(
			`delete from permission
				where person = :personId
			`,{
				replacements: {
					personId: personId,
				},
				type: db.sequelize.QueryTypes.DELETE,
			}
		);
		await db.sequelize.query(
			`delete from contact
				where person = :personId
			`,
			{
				replacements: {
					personId: personId,
				},
				type: db.sequelize.QueryTypes.DELETE,
			}
		);
	});

	it ('User has no school in an unexpected tournament', async () => {

		const res = await request(server)
			.get(`/v1/user/chapter/byTourn/29807/mySchools`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${userkey}`])
			.expect('Content-Type', /json/)
			.expect(200);

		const body = res.body;
		assert.typeOf(body, 'array'  , 'Array returned');
		assert.equal(body.length, 0);

	});

	it ('User has a school in an expected tournament by permission', async () => {

		const res = await request(server)
			.get(`/v1/user/chapter/byTourn/${testUserChapterPerm.tourn}/mySchools`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${userkey}`])
			.expect('Content-Type', /json/)
			.expect(200);

		const body = res.body;

		assert.equal(body.length, 1);
		assert.typeOf(body, 'array'  , 'Array returned');
		assert.equal(body[0].id, testUserChapterPerm.school);
		assert.equal(body[0].students.length, 1);
	});

	it ('User has a school in an expected tournament by contact status', async () => {

		const res = await request(server)
			.get(`/v1/user/chapter/byTourn/${ testUserSchoolContact.tourn }/mySchools`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${userkey}`])
			.expect('Content-Type', /json/)
			.expect(200);

		const body = res.body;

		assert.typeOf(body, 'array'  , 'Array returned');
		assert.equal(body.length, 1);
		assert.equal(body[0].chapter, testUserSchoolContact.chapter);
		assert.equal(body[0].id, testUserSchoolContact.school);
	});

	it ('Schools not in a tournament are delivered correctly', async () => {

		const res = await request(server)
			.get(`/v1/user/chapter/byTourn/30661/nonSchools`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${userkey}`])
			.expect('Content-Type', /json/)
			.expect(200);

		const body = res.body;

		assert.typeOf(body, 'array'  , 'Array returned');
		assert.equal(body.length, 1);
	});
});