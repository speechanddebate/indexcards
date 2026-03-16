import circuitRepo from '../../api/repos/circuitRepo.js';
import { faker } from '@faker-js/faker';

export function createCircuitData(overrides = {}) {
	return {
		name: faker.lorem.sentence(),
		abbr: faker.string.alpha(4),
		state: faker.location.state({ abbreviated: true }),
		country: faker.location.countryCode(),
		tz: faker.location.timeZone(),
		active: true,
		...overrides,
	};
}

export async function createTestCircuit(overrides = {}) {
	const data = createCircuitData(overrides);
	const circuitId = await circuitRepo.createCircuit(data);

	return {
		circuitId,
		getCircuit: () => circuitRepo.getCircuit(circuitId),
	};
}
export default {
	createCircuitData,
	createTestCircuit,
};