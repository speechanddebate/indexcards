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
	const { id: sessionId } = await sessionRepo.createSession(data);

	return {
		sessionId,
		getSession: () => sessionRepo.getSession(sessionId, { settings: true }),
	};
}
export default {
	createTestSession,
	createSessionData,
};