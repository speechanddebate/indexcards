
import request from 'supertest';
import server from '../../../../../app.js';
import factories from '../../../../../tests/factories/index.js';

describe('Inbox Router', () => {
	describe('/user/inbox/unread', () => {
		it('Returns the number of unread messages', async () => {
			const { personId } = await factories.person.createTestPerson();
			await factories.message.createTestMessage({ person: personId });
			const { userkey } = await factories.session.createTestSession({ personId });

			const res = await request(server)
				.get('/v1/user/inbox/unread')
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`)
				.expect('Content-Type', /json/)
				.expect(200);
			expect(res.body).toBeTypeOf('object');
			expect(res.body).toHaveProperty('count');
			expect(res.body.count).toBe(1);
		});
	});
});