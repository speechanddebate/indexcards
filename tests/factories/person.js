import personRepo from '../../api/repos/personRepo.js';
import { faker } from '@faker-js/faker';
import factories from './index.js';

export function createPersonData(overrides = {}) {
	// Ensure email is always unique by adding a random string
	const uniqueEmail = `user_${Math.random().toString(36).substring(2, 10)}_${Date.now()}@example.com`;
	return {
		email: uniqueEmail,
		first: faker.person.firstName(),
		middle: faker.datatype.boolean() ? faker.person.middleName() : null,
		last: faker.person.lastName(),
		state: faker.location.state({abbreviated: true}),
		country: faker.location.countryCode(),
		tz: faker.location.timeZone(),
		...overrides,
	};
}

export async function create(overrides = {}) {

	const data = createPersonData({
		...overrides,
	});

	const personId = await personRepo.createPerson(data);

	return {
		personId,
		getPerson: () => personRepo.getPerson(personId),
	};
}
export async function createJudge(overrides = {}) {
	const data = createPersonData({
		...overrides,
	});

	const personId = await personRepo.createPerson(data);
	await factories.judge.createTestJudge({ person: personId });

	return {
		personId,
		getPerson: () => personRepo.getPerson(personId),
	};
}

export default {
	create,
	createPersonData,
	createJudge,
};