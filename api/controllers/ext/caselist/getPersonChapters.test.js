import request from 'supertest';
import { assert } from 'chai';
import config from '../../../../config/config';
import server from '../../../../app';
import { testAdminSession } from '../../../../tests/testFixtures';

describe('Person Chapters', () => {
	it('Returns chapters for a person', async () => {
		const res = await request(server)
			.get(`/v1/ext/caselist/chapters?person_id=17145`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${testAdminSession.userkey}`])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isArray(res.body, 'Response is an array');
	});
});
