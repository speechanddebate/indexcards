import personRepo from '../../api/repos/personRepo.js';
import { faker } from '@faker-js/faker';

export function createPersonData(overrides = {}) {
	// Ensure email is always unique by adding a random string
	const uniqueEmail = `user_${Math.random().toString(36).substring(2, 10)}_${Date.now()}@example.com`;
	return {
		email: uniqueEmail,
		firstName: faker.person.firstName(),
		middleName: faker.datatype.boolean() ? faker.person.middleName() : null,
		lastName: faker.person.lastName(),
		state: faker.location.state({abbreviated: true}),
		country: faker.location.countryCode(),
		tz: faker.location.timeZone(),
		...overrides,
	};
}

export async function createTestPerson(overrides = {}) {

	const data = createPersonData({
		...overrides,
	});

	const personId = await personRepo.createPerson(data);

	return {
		personId,
		getPerson: () => personRepo.getPerson(personId),
	};
}

export default {
	createTestPerson,
	createPersonData,
};