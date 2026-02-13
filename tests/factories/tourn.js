import { faker } from '@faker-js/faker';
import { fakeTournName, toWebName, noMs } from './factoryUtils.js';
import tournRepo from '../../api/repos/tournRepo.js';

export function createTournData(overrides = {}) {
	const name = overrides.name ?? fakeTournName();
	const country = overrides.country ?? 'US';
	return {
		name,
		country,
		city: faker.location.city(),
		state: (country === 'US' ? faker.location.state({ abbreviated: true }): null),
		tz: (country === 'US' ? faker.helpers.arrayElement([
			'America/New_York',
			'America/Chicago',
			'America/Denver',
			'America/Los_Angeles',
		])
				: 'UTC'),
		webname: toWebName(name),
		startDate: noMs(faker.date.past()),
		endDate: noMs(faker.date.future()),
		regStartDate: noMs(faker.date.past()),
		regEndDate: noMs(faker.date.future()),
		...overrides,
	};
}

export async function createTestTourn(overrides = {}) {
	const data = createTournData(overrides);
	const tournId = await tournRepo.createTourn(data);

	return {
		tournId,
		getTourn: () => tournRepo.getTourn(tournId, { settings: true }),
	};
}
export default {
	createTournData,
	createTestTourn,
};