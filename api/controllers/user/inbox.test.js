
import { createContext } from '../../../tests/httpMocks.ts';
import messageRepo from '../../repos/messageRepo';
import * as inbox from './inbox.js';
import { expect } from 'chai';
import { InboxMessage } from '../../routes/openapi/schemas/Message';

describe('markDeleted', () => {
	it('returns 404 if message not found', async () => {
		const messageId = 1;
		const personId = 1;
		vi.spyOn(messageRepo, 'getMessage').mockResolvedValue(null);
		const { req, res } = createContext({ req: { valid: { params: { messageId } }, actor: { Person: { id: personId } } } });
		await inbox.deleteMessage(req, res);
		expect(res.status).toHaveBeenCalledWith(404);
	});

	it('does not override existing deleted_at date', async () => {
		const messageId = 2;
		const personId = 1;
		const originalDeletedAt = new Date('2026-01-01T00:00:00.000Z');
		const message = {
			deleted_at: originalDeletedAt,
			save: vi.fn().mockResolvedValue(undefined),
		};
		vi.spyOn(messageRepo, 'getMessage').mockResolvedValue(message);
		const { req, res } = createContext({ req: { valid: { params: { messageId } }, actor: { Person: { id: personId } } } });

		await inbox.deleteMessage(req, res);

		expect(message.deleted_at).to.equal(originalDeletedAt);
		expect(res.status).toHaveBeenCalledWith(204);
	});
});
describe('markRead', () => {
	it('returns 404 if message not found', async () => {
		const messageId = 1;
		const personId = 1;
		vi.spyOn(messageRepo, 'getMessage').mockResolvedValue(null);
		const { req, res } = createContext({ req: { valid: { params: { messageId } }, actor: { Person: { id: personId } } } });
		await inbox.readMessage(req, res);
		expect(res.status).toHaveBeenCalledWith(404);
	});

	it('does not override existing read_at date', async () => {
		const messageId = 2;
		const personId = 1;
		const originalReadAt = new Date('2026-01-01T00:00:00.000Z');
		const message = {
			read_at: originalReadAt,
			save: vi.fn().mockResolvedValue(undefined),
		};
		vi.spyOn(messageRepo, 'getMessage').mockResolvedValue(message);
		const { req, res } = createContext({ req: { valid: { params: { messageId } }, actor: { Person: { id: personId } } } });

		await inbox.readMessage(req, res);

		expect(message.read_at).to.equal(originalReadAt);
		expect(res.status).toHaveBeenCalledWith(204);
	});
});

describe('markUnread', () => {
	it('returns 404 if message not found', async () => {
		const messageId = 1;
		const personId = 1;
		vi.spyOn(messageRepo, 'getMessage').mockResolvedValue(null);
		const { req, res } = createContext({ req: { valid: { params: { messageId } }, actor: { Person: { id: personId } } } });
		await inbox.unreadMessage(req, res);
		expect(res.status).toHaveBeenCalledWith(404);
	});

	it('clears read_at and returns 204', async () => {
		const messageId = 2;
		const personId = 1;
		const message = {
			read_at: new Date('2026-01-01T00:00:00.000Z'),
			save: vi.fn().mockResolvedValue(undefined),
		};
		vi.spyOn(messageRepo, 'getMessage').mockResolvedValue(message);
		const { req, res } = createContext({ req: { valid: { params: { messageId } }, actor: { Person: { id: personId } } } });

		await inbox.unreadMessage(req, res);

		expect(message.read_at).to.equal(null);
		expect(message.save).toHaveBeenCalledTimes(1);
		expect(res.status).toHaveBeenCalledWith(204);
	});
});
describe('getMessage', () => {
	it('maps the result to a Message object', async () => {
		const messageId = 1;
		const personId = 1;
		const visibleAt = new Date('2026-01-01T10:00:00.000Z');
		const readAt = new Date('2026-01-02T11:30:00.000Z');
		vi.spyOn(messageRepo, 'getMessage').mockResolvedValue({
			id: messageId,
			subject: 'Pairings posted',
			body: 'Round 1 pairings are now available.',
			url: 'https://www.tabroom.com/pairings',
			visible_at: visibleAt,
			read_at: readAt,
			tourn_tourn: {
				id: 9,
				name: 'Spring Invitational',
				webname: 'spring-invite',
			},
			sender_sender: {
				first: 'Alex',
				middle: null,
				last: 'Coach',
				email: 'alex@example.com',
			},
			email_email: {
				content: 'Please report to your assigned rooms.',
			},
		});
		const { req, res } = createContext({ req: { valid: { params: { messageId } }, actor: { Person: { id: personId } } } });
		await inbox.getMessage(req, res);
		expect(res).not.toBeProblemResponse();
		expect(res.body).toMatchSchema(InboxMessage);
	});
	it('returns 404 if message not found', async () => {
		const messageId = 1;
		const personId = 1;
		vi.spyOn(messageRepo, 'getMessage').mockResolvedValue(null);
		const { req, res } = createContext({ req: { valid: { params: { messageId } }, actor: { Person: { id: personId } } } });
		await inbox.getMessage(req, res);
		expect(res.status).toHaveBeenCalledWith(404);
	});
});