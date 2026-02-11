import timeslotRepo from '../../api/repos/timeslotRepo.js';
import { fakeRoundName, noMs} from './factoryUtils.js';
import { faker } from '@faker-js/faker';

export function createTimeslotData(overrides = {}) {
	const start = faker.date.future();
	// Random minutes between 30 and 120
	const minutes = faker.number.int({ min: 30, max: 120 });
	const end = new Date(start.getTime() + minutes * 60 * 1000);
	return {
		name: fakeRoundName(),
		start: noMs(start),
		end: noMs(end),
		...overrides,
	};
}

export async function createTestTimeslot(overrides = {}) {
	const data = createTimeslotData(overrides);

	const timeslotId = await timeslotRepo.createTimeslot(data);

	return {
		timeslotId,
		getTimeslot: () => timeslotRepo.getTimeslot(timeslotId),
	};
}
export default {
	createTimeslotData,
	createTestTimeslot,
};
