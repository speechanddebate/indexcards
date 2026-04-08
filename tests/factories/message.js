import factories from './index.js';
import messageRepo from '../../api/repos/messageRepo.js';
import { faker } from '@faker-js/faker';

export function createMessageData(overrides = {}) {
	return {
		subject: faker.lorem.sentence(),
		body: faker.lorem.paragraph(),
		visible_at: faker.date.past(),
		...overrides,
	};
}

export async function createTestMessage(overrides = {}) {
	if(overrides.sender === undefined){
		const { personId: senderId } = await factories.person.createTestPerson();
		overrides.sender = senderId;
	}
	const data = createMessageData({
		...overrides,
	});

	const messageId = await messageRepo.createMessage(data);

	return {
		messageId,
		getMessage: () => messageRepo.getMessage(messageId),
	};
}

export default {
	createTestMessage,
	createMessageData,
};