import eventRepo from '../../api/repos/eventRepo.js';
import { faker } from '@faker-js/faker';

const EVENT_TYPES = [
	'speech',
	'congress',
	'debate',
	'wudc',
	'wsdc',
	'attendee',
	'mock_trial',
];

const EVENT_LEVELS = [
	'open',
	'jv',
	'novice',
	'champ',
	'es-open',
	'es-novice',
	'middle',
];

export function createEventData(overrides = {}) {
	return {
		type: faker.helpers.arrayElement(EVENT_TYPES),
		level: faker.helpers.arrayElement(EVENT_LEVELS),
		...overrides,
	};
}

export async function createTestEvent(overrides = {}) {
	const data = createEventData(overrides);
	const eventId = await eventRepo.createEvent(data);

	return {
		eventId,
		getEvent: () => eventRepo.getEvent(eventId),
	};
}
export default {
	createEventData,
	createTestEvent,
};