import { assert } from 'chai';
import request from 'supertest';
import server from '../../../../app';

import db from '../../../data/db';

import config from '../../../../config/config';

import {
	testUserChapterPerm,
	testUserSchoolContact,
	testUserSession,
} from '../../../../tests/testFixtures';

describe ('getMySchoolsByTourn', () => {

	beforeEach(async () => {
		await db.permission.upsert(testUserChapterPerm);
		await db.contact.create(testUserSchoolContact);
	});
	afterEach(async () => {
		await db.sequelize.query(
			`delete from permission
				where person = :personId
				and chapter = :chapterId
			`,{
				replacements: {
					personId: testUserChapterPerm.person,
					chapterId: testUserChapterPerm.chapter,
				},
				type: db.sequelize.QueryTypes.DELETE,
			}
		);
		await db.sequelize.query(
			`delete from contact
				where person = :personId
				and school = :schoolId
			`,
			{
				replacements: {
					personId: testUserSchoolContact.person,
					schoolId: testUserSchoolContact.school,
				},
				type: db.sequelize.QueryTypes.DELETE,
			}
		);
	});

	it ('User has no school in an unexpected tournament', async () => {

		const res = await request(server)
			.get(`/v1/user/chapter/byTourn/29807/mySchools`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${testUserSession.userkey}`])
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
			.set('Cookie', [`${config.COOKIE_NAME}=${testUserSession.userkey}`])
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
			.set('Cookie', [`${config.COOKIE_NAME}=${testUserSession.userkey}`])
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
			.set('Cookie', [`${config.COOKIE_NAME}=${testUserSession.userkey}`])
			.expect('Content-Type', /json/)
			.expect(200);

		const body = res.body;

		assert.typeOf(body, 'array'  , 'Array returned');
		assert.equal(body.length, 1);
	});
});