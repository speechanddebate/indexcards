import messageRepo from './messageRepo';
import factories from '../../tests/factories';
import { faker } from '@faker-js/faker';

describe('messageRepo',() =>{
	describe('buildMessageQuery', () => {
		it('does not include associations by default', async () => {
			const { personId: recipientId } = await factories.person.createTestPerson();
			const { personId: senderId } = await factories.person.createTestPerson();
			const { tournId } = await factories.tourn.createTestTourn();
			const { messageId } = await factories.message.createTestMessage({
				person: recipientId,
				sender: senderId,
				tourn: tournId,
			});

			const message = await messageRepo.getMessage(messageId, recipientId);

			expect(message).toBeDefined();
			expect(message.sender_person).toBeUndefined();
			expect(message.tourn_tourn).toBeUndefined();
			expect(message.email_email).toBeUndefined();
		});

		it('includes sender when requested', async () => {
			const { personId: recipientId } = await factories.person.createTestPerson();
			const { personId: senderId } = await factories.person.createTestPerson();
			const { messageId } = await factories.message.createTestMessage({
				person: recipientId,
				sender: senderId,
			});

			const message = await messageRepo.getMessage(messageId, recipientId, {
				include: {
					Sender: true,
				},
			});

			expect(message).toBeDefined();
			expect(message.sender_person).toBeDefined();
			expect(message.sender_person.id).toBe(senderId);
		});

		it('includes tourn when requested', async () => {
			const { personId: recipientId } = await factories.person.createTestPerson();
			const { tournId } = await factories.tourn.createTestTourn();
			const { messageId } = await factories.message.createTestMessage({
				person: recipientId,
				tourn: tournId,
			});

			const message = await messageRepo.getMessage(messageId, recipientId, {
				include: {
					Tourn: true,
				},
			});

			expect(message).toBeDefined();
			expect(message.tourn_tourn).toBeDefined();
			expect(message.tourn_tourn.id).toBe(tournId);
		});
	});

	describe('getMessage',() =>{
		it('returns a specific message for a specific person', async () => {
			const { personId } = await factories.person.createTestPerson();
			const { messageId } = await factories.message.createTestMessage({ person: personId });
			const message = await messageRepo.getMessage(messageId, personId);
			expect(message).not.toBeNull();
			expect(message.id).toBe(messageId);
		});
		it('returns null for a message that does not belong to the person', async () => {
			const { personId: personId1 } = await factories.person.createTestPerson();
			const { personId: personId2 } = await factories.person.createTestPerson();
			const { messageId } = await factories.message.createTestMessage({ person: personId1 });
			const message = await messageRepo.getMessage(messageId, personId2);
			expect(message).toBeNull();
		});
		it('returns null for a message that does not exist', async () => {
			const { personId } = await factories.person.createTestPerson();
			const message = await messageRepo.getMessage(9999, personId);
			expect(message).toBeNull();
		});
		it('returns a message when no person is specified', async () => {
			const { personId } = await factories.person.createTestPerson();
			const { messageId } = await factories.message.createTestMessage({ person: personId });
			const message = await messageRepo.getMessage(messageId);
			expect(message).not.toBeNull();
			expect(message.id).toBe(messageId);
		});
	});
	describe('getMessages',() =>{
		it('returns all messages for a specific person', async () => {
			const { personId } = await factories.person.createTestPerson();
			await factories.message.createTestMessage({ person: personId });
			await factories.message.createTestMessage({ person: personId });
			const messages = await messageRepo.getMessages(personId);
			expect(messages.length).toBe(2);
		});
	});
	describe('getUnreadCount',() =>{
		it('should return the count of unread messages for a specific person', async () => {
			const { personId } = await factories.person.createTestPerson();
			await factories.message.createTestMessage({ person: personId });
			await factories.message.createTestMessage({ person: personId });
			const count = await messageRepo.getUnreadCount(personId);
			expect(count).toBe(2);
		});
		it('should throw an error if personId is not provided', async () => {
			await expect(messageRepo.getUnreadCount()).rejects.toThrow('personId is required');
		});

	});
	describe('markAllMessagesRead',() =>{
		it('should mark all messages as read for a specific person', async () => {
			const { personId } = await factories.person.createTestPerson();
			const { messageId: messageId1 } = await factories.message.createTestMessage({ person: personId });
			const { messageId: messageId2 } = await factories.message.createTestMessage({ person: personId });
			const result = await messageRepo.markAllMessagesRead(personId);
			expect(result).toBeTruthy();
			const message1 = await messageRepo.getMessage(messageId1);
			const message2 = await messageRepo.getMessage(messageId2);
			expect(message1.read_at).not.toBeNull();
			expect(message2.read_at).not.toBeNull();
		});
		it('returns the number of messages marked as read', async () => {
			const { personId } = await factories.person.createTestPerson();
			await factories.message.createTestMessage({ person: personId });
			await factories.message.createTestMessage({ person: personId });
			let result = await messageRepo.markAllMessagesRead(personId);
			expect(result).toBe(2);
			result = await messageRepo.markAllMessagesRead(personId);
			expect(result).toBe(0);
		});
		it('does not mark messages as read for a different person', async () => {
			const { personId: personId1 } = await factories.person.createTestPerson();
			const { personId: personId2 } = await factories.person.createTestPerson();
			const { messageId } = await factories.message.createTestMessage({ person: personId1 });
			const result = await messageRepo.markAllMessagesRead(personId2);
			expect(result).toBe(0);
			const message = await messageRepo.getMessage(messageId);
			expect(message.read_at).toBeNull();
		});
		it('does not mark messages as read if they are not yet visible', async () => {
			const { personId } = await factories.person.createTestPerson();
			const { messageId } = await factories.message.createTestMessage({
				person: personId,
				visible_at: faker.date.future(),
			});

			const result = await messageRepo.markAllMessagesRead(personId);
			expect(result).toBe(0);
			const message = await messageRepo.getMessage(messageId);
			expect(message.read_at).toBeNull();
		});
		it('does not mark messages as read if they are already read', async () => {
			const oldReadDate = new Date();
			const { personId } = await factories.person.createTestPerson();
			const { messageId } = await factories.message.createTestMessage({
				person: personId,
				read_at: oldReadDate,
			});
			const result = await messageRepo.markAllMessagesRead(personId);
			expect(result).toBe(0);
			const message = await messageRepo.getMessage(messageId);
			expect(message.read_at).toEqualDate(oldReadDate);
		});
	});
});
