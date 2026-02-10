import sessionRepo from '../../api/repos/sessionRepo.js';
import { faker } from '@faker-js/faker';

export function createSessionData(overrides = {}) {
	return {
		ip: faker.internet.ip(),
		...overrides,
	};
}

export async function createTestSession(overrides = {}) {
	const data = createSessionData(overrides);
	console.log(`session create data is `);
	console.log(data);
	const { id: sessionId, userkey } = await sessionRepo.createSession(data);

	return {
		sessionId,
		userkey,
		getSession: () => sessionRepo.getSession(sessionId, { settings: true }),
	};
}
export default {
	createTestSession,
	createSessionData,
};