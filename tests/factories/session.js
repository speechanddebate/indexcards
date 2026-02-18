import sessionRepo from '../../api/repos/sessionRepo.js';
import factories from './index.js';
import { faker } from '@faker-js/faker';

export function createSessionData(overrides = {}) {
	return {
		ip: faker.internet.ip(),
		...overrides,
	};
}

export async function createTestSession(overrides = {}) {
	if(!overrides.personId) {
		const { personId } = await factories.person.createTestPerson();
		overrides.personId = personId;
	}

	const data = createSessionData(overrides);
	const { id: sessionId, userkey } = await sessionRepo.createSession(data);

	return {
		sessionId,
		personId: overrides.personId,
		userkey,
		getSession: () => sessionRepo.getSession(sessionId, { settings: true }),
	};
}
export default {
	createTestSession,
	createSessionData,
};