import request from 'supertest';
import config from '../../../../config/config';
import server from '../../../../app';
import { testAdminSession } from '../../../../tests/testFixtures';

describe('Caselist Link', () => {
	it('Creates a caselist link', async () => {
		await request(server)
			.post(`/v1/ext/caselist/link`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${testAdminSession.userkey}`])
			.send({ person_id: 17145, slug: '/test', eventcode: 103 })
			.expect('Content-Type', /json/)
			.expect(201);
	});
});
