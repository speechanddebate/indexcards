import request from 'supertest';
import { assert } from 'chai';
import server from '../../../../app';
import { testUserAPIKey } from '../../../../tests/testFixtures';

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
			.expect('Content-Type', /json/)
			.expect(401);

		assert.isObject(res.body);
		assert.equal(res.body.message, 'That function is not accessible to your API credentials.  Key caselist required');
	});

});
