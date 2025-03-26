import request from 'supertest';
import { assert } from 'chai';
import server from '../../../../app';
import { testUserAPIKey } from '../../../../tests/testFixtures';

const authHeader = Buffer.from(`69:${testUserAPIKey.value}`).toString('base64');

describe('Person History', () => {

	it('Returns history for a person', async () => {

		// Victim of the day!
		const res = await request(server)
			.get(`/v1/ext/nsda/history?nsda_id=123456`)
			.set('Accept', 'application/json')
			.set('Authorization', `Basic ${authHeader}`)
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isObject(res.body, 'Response is an object');
		assert.property(res.body, 'personId', 'Response has personId property');
		assert.property(res.body, 'student', 'Response has student property');
		assert.property(res.body, 'judge', 'Response has judge property');
		assert.property(res.body, 'quizzes', 'Response has quizzes property');
		assert.equal(res.body.personId, '123215', 'Returned the proper NSDA ID for the end user');

	}, 30000);

	it('Errors on a missing person id', async () => {
		await request(server)
			.get(`/v1/ext/nsda/history?nsda_id=999999999`)
			.set('Accept', 'application/json')
			.set('Authorization', `Basic ${authHeader}`)
			.expect('Content-Type', /json/)
			.expect(400);
	}, 30000);
});
