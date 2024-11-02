import request from 'supertest';
import { assert } from 'chai';
import db from '../../../helpers/db';
import server from '../../../../app';
import { testUserAPIKey } from '../../../../tests/testFixtures';

const authHeader = Buffer.from(`69:${testUserAPIKey.value}`).toString('base64');

describe('Person Rounds', () => {
	it('Returns rounds for a person', async () => {
		const res = await request(server)
			.get(`/v1/ext/caselist/rounds?person_id=17145`)
			.set('Accept', 'application/json')
			.set('Authorization', `Basic ${authHeader}`)
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isArray(res.body, 'Response is an array');
	});

	it('Returns rounds for a slug', async () => {
		await db.sequelize.query(`
			INSERT INTO caselist (slug, eventcode, person) VALUES ('/test', 103, 17145)
        `);
		const res = await request(server)
			.get(`/v1/ext/caselist/rounds?slug=/test`)
			.set('Accept', 'application/json')
			.set('Authorization', `Basic ${authHeader}`)
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isArray(res.body, 'Response is an array');
	});
});
