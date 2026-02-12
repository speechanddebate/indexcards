import request from 'supertest';
import { assert } from 'chai';
import server from '../../../../../app.js';
import { testUserAPIKey } from '../../../../../tests/testFixtures';
import db from '../../../../data/db.js';

const authHeader = Buffer.from(`69:${testUserAPIKey.value}`).toString('base64');
const badAuthHeader = Buffer.from(`70:${testUserAPIKey.value}nopesauce`).toString('base64');

describe('Person Chapters', () => {
	it('Returns chapters for a person', async () => {
		const res = await request(server)
			.get(`/v1/ext/caselist/chapters?person_id=17145`)
			.set('Accept', 'application/json')
			.set('Authorization', `Basic ${authHeader}`)
			.expect('Content-Type', /json/)
			.expect(200);
		assert.isArray(res.body, 'Response is an array');
	});

	it('Fails to return chapters for a person', async () => {
		const res = await request(server)
			.get(`/v1/ext/caselist/chapters?person_id=17145`)
			.set('Accept', 'application/json')
			.set('Authorization', `Basic ${badAuthHeader}`)
			.expect('Content-Type', /json/);

		expect(res).toBeProblemResponse(401);
	});

});
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
describe('Person Students', () => {
	it('Returns students for a person', async () => {
		const res = await request(server)
			.get(`/v1/ext/caselist/students?person_id=17145`)
			.set('Accept', 'application/json')
			.set('Authorization', `Basic ${authHeader}`)
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isArray(res.body, 'Response is an array');
	});
});
describe('Caselist Link', () => {
	it('Creates a caselist link', async () => {
		const res = await request(server)
			.post(`/v1/ext/caselist/link`)
			.set('Accept', 'application/json')
			.set('Authorization', `Basic ${authHeader}`)
			.send({ person_id: 17145, slug: '/test', eventcode: 103 })
			.expect('Content-Type', /json/)
			.expect(201);

		expect(res.body).toBeDefined();
	});
});