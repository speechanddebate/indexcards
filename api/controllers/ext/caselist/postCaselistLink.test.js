import request from 'supertest';
import server from '../../../../app';
import { testUserAPIKey } from '../../../../tests/testFixtures';

const authHeader = Buffer.from(`69:${testUserAPIKey.value}`).toString('base64');

describe('Caselist Link', () => {
	it('Creates a caselist link', async () => {
		await request(server)
			.post(`/v1/ext/caselist/link`)
			.set('Accept', 'application/json')
			.set('Authorization', `Basic ${authHeader}`)
			.send({ person_id: 17145, slug: '/test', eventcode: 103 })
			.expect('Content-Type', /json/)
			.expect(201);
	});
});
