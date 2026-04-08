
import request from 'supertest';
import server from '../../../../../app.js';
import factories from '../../../../../tests/factories/index.js';
import z from 'zod';
import { Message } from '../../../openapi/schemas/Message.js';
import messageRepo from '../../../../repos/messageRepo.js';;

describe('Inbox Router', () => {
	let personId;
	let userkey;
	beforeAll(async () => {
		({ personId } = await factories.person.createTestPerson());
		await factories.message.createTestMessage({ person: personId });
		({ userkey } = await factories.session.createTestSession({ person: personId }));
	});

	describe('GET /user/inbox', () => {
		it('Returns the list of messages for the user', async () => {
			const res = await request(server)
				.get('/v1/user/inbox')
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`)
				.expect('Content-Type', /json/)
				.expect(200);

			expect(res.body).toMatchSchema(z.array(Message));
		});
	});
	describe('GET /user/inbox/unread', () => {
		it('Returns the number of unread messages', async () => {
			const { personId: person1 } = await factories.person.createTestPerson();
			await factories.message.createTestMessage({ person: person1 });
			const { userkey: key1 } = await factories.session.createTestSession({ person: person1 });

			const res = await request(server)
				.get('/v1/user/inbox/unread')
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${key1}`)
				.expect('Content-Type', /json/)
				.expect(200);
			expect(res.body).toBeTypeOf('object');
			expect(res.body).toHaveProperty('count');
			expect(res.body.count).toBe(1);
		});
	});
	describe('POST /user/inbox/markAllRead', () => {
		it('Marks all messages as read', async () => {
			const { messageId } = await factories.message.createTestMessage({ person: personId });
			const res = await request(server)
				.post('/v1/user/inbox/markAllRead')
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`);
			expect(res).not.toBeProblemResponse();
			const message = await messageRepo.getMessage(messageId);
			expect(message.read_at).not.toBeNull();

		});
	});

	describe('POST /user/inbox/{messageId}/markRead', () => {
		it('Marks a message as read', async () => {
			const { messageId } = await factories.message.createTestMessage({ person: personId });

			const res = await request(server)
				.post(`/v1/user/inbox/${messageId}/markRead`)
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`);

			expect(res).not.toBeProblemResponse();
			const message = await messageRepo.getMessage(messageId);
			expect(message.read_at).not.toBeNull();

		});
	});
	describe('GET /user/inbox/{messageId}', () => {
		it('Gets a message by ID', async () => {
			const { messageId } = await factories.message.createTestMessage({ person: personId });

			const res = await request(server)
				.get(`/v1/user/inbox/${messageId}`)
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`);

			expect(res).not.toBeProblemResponse();
			expect(res.body).toMatchSchema(Message);
		});
	});
	describe('DELETE /user/inbox/{messageId}', () => {
		it('Marks a message as deleted', async () => {
			const { messageId } = await factories.message.createTestMessage({ person: personId });

			const res = await request(server)
				.delete(`/v1/user/inbox/${messageId}`)
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`);

			expect(res).not.toBeProblemResponse();
			const message = await messageRepo.getMessage(messageId);
			expect(message.deleted_at).not.toBeNull();

		});
	});
});
