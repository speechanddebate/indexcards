import { faker } from '@faker-js/faker';
import { fakeTournName, toWebName, noMs } from './factoryUtils.js';
import tournRepo from '../../api/repos/tournRepo.js';
import db from '../../api/data/db.js';
import factories from './index.js';

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
		hidden: 0,
		start: noMs(faker.date.past()),
		end: noMs(faker.date.future()),
		regStart: noMs(faker.date.past()),
		regEnd: noMs(faker.date.future()),
		...overrides,
	};
}

export async function createTestTourn(overrides = {}) {
	const data = createTournData(overrides);
	const tournId = await tournRepo.createTourn(data);

	if(overrides.circuit) {
		await db.tournCircuit.create({ tourn: tournId, circuit: overrides.circuit, approved: true });
	}

	return {
		tournId,
		getTourn: () => tournRepo.getTourn(tournId, { settings: true }),
	};
}
//create a full test tourn with category, event and the like
export async function createFull(overrides = {}){
	const data = createTournData(overrides);
	const tournId = await tournRepo.createTourn(data);

	const { categoryId } = await factories.category.createTestCategory({ tourn: tournId });
	const { eventId } = await factories.event.create({ category: categoryId });
	const { timeslotId } = await factories.timeslot.createTestTimeslot();
	const { roundId } = await factories.round.create({
		event: eventId,
		timeslot: timeslotId,
		settings: {
			judges_ballots_visible: 1,
		},
	});
	return {
		tournId,
		getTourn: () => tournRepo.getTourn(tournId, { settings: true }),
		categoryId,
		eventId,
		roundId,
	};
};
export default {
	createTournData,
	createTestTourn,
	createFull,
};
