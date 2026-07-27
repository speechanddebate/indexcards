import request from 'supertest';
import { assert } from 'chai';
import config from '../../../config.js';
import server from '../../../../app';
import factories from '../../../../tests/factories';

describe('User Profile Loader', () => {
	it('Returns correct JSON for a self profile request', async () => {
		const { personId, getPerson } = await factories.person.create({site_admin: true});
		const { userkey } = await factories.session.createTestSession({ person: personId });
		const res = await request(server)
			.get(`/v1/user/profile`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.cookie.name}=${userkey}`])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isObject(res.body, 'Response is an object');

		const person = await getPerson();
		assert.equal(
			res.body.email,
			person.email,
			'Correct fake user profile is returned'
		);

		assert.isTrue(res.body.site_admin, 'Site Admin powers are enabled');
	});

	it('Returns correct JSON for another user profile request', async () => {
		const { personId } = await factories.person.create({site_admin: true});
		const { userkey } = await factories.session.createTestSession({ person: personId });
		const res = await request(server)
			.get(`/v1/user/profile/1`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.cookie.name}=${userkey}`])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isObject(res.body, 'Response is an object');

		assert.exists(
			res.body.email,
			'Email field is present'
		);
	});
});
