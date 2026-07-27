import request from 'supertest';
import { assert } from 'chai';
import config from '../../../config';
import server from '../../../../app';
import db from '../../../data/db';
import factories from '../../../../tests/factories';

describe('User Chapter', () => {
	let userkey, personId;
	beforeAll(async () => {
		const session = await factories.session.createTestSession();
		userkey = session.userkey;
		personId = session.personId;
		await factories.permission.create({
			chapter : 130737,
			school  : 699354,
			tourn   : 31059,
			person  : personId,
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
	});

	it('Returns correct JSON for school dashboard request', async () => {
		const res = await request(server)
			.get(`/v1/user/chapters/byTourn/30661`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.cookie.name}=${userkey}`])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isObject(res.body, 'Response is an object');
		assert.isArray(res.body.chapters, 'Response object has an array of chapters');
		assert.isArray(res.body.events, 'Response object has an array of events');

		assert.equal(
			res.body.chapters[1].name,
			'University School Of Nashville',
			'Correct school delivered with dashboard access'
		);

		assert.equal(
			res.body.chapters[1].permission,
			'dashboard',
			'Correct school delivered with dashboard access'
		);
	});

	afterAll(async () => {
		await db.sequelize.query(
			`delete from permission where person = :personId and chapter = :chapterId `,
			{
				replacements: {
					personId: personId,
					chapterId: 130737,
				},
				type: db.sequelize.QueryTypes.DELETE,
			}
		);
		await db.sequelize.query(
			`delete from contact where person = :personId`,
			{
				replacements: {
					personId: personId,
				},
				type: db.sequelize.QueryTypes.DELETE,
			}
		);
	});

});
