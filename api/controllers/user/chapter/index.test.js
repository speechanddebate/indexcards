import request from 'supertest';
import { assert } from 'chai';
import config from '../../../../config/config';
import server from '../../../../app';
import db from '../../../helpers/db';
import { testUserChapterPerm, testUserSchoolContact, testUserSession } from '../../../../tests/testFixtures';

describe('User Chapter', () => {

	beforeAll(async () => {
		await db.permission.create(testUserChapterPerm);
		await db.contact.create(testUserSchoolContact);
	});

	it('Returns correct JSON for user chapter permission request', async () => {
		const res = await request(server)
			.get(`/v1/user/chapter`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${testUserSession.userkey}`])
			.expect('Content-Type', /json/)
			.expect(200);
		assert.isArray(res.body, 'Response is an array');

		assert.equal(
			res.body[0].id,
			'130737',
			'Correct Chapter ID returned'
		);
		assert.equal(
			res.body[0].coaches,
			'bfe89528',
			'Correct Chapter coaches returned'
		);
		assert.equal(
			res.body[0].permission,
			'chapter',
			'Correct Chapter level permissions returned'
		);
	});

	it('Returns correct JSON for school dashboard request', async () => {
		const res = await request(server)
			.get(`/v1/user/chapter/byTourn/30661`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${testUserSession.userkey}`])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isArray(res.body, 'Response is an array');

		assert.equal(
			res.body[1].name,
			'University School of Nashville',
			'Correct school delivered with dashboard access'
		);

		assert.equal(
			res.body[1].permission,
			'dashboard',
			'Correct school delivered with dashboard access'
		);
	});

	afterAll(async () => {
		await db.sequelize.query(
			`delete from permission where person = :personId and chapter = :chapterId `,
			{
				replacements: {
					personId: testUserChapterPerm.person,
					chapterId: testUserChapterPerm.chapter,
				},
				type: db.sequelize.QueryTypes.DELETE,
			}
		);
		await db.sequelize.query(
			`delete from contact where person = :personId and school = :schoolId `,
			{
				replacements: {
					personId: testUserSchoolContact.person,
					schoolId: testUserSchoolContact.school,
				},
				type: db.sequelize.QueryTypes.DELETE,
			}
		);
	});

});
