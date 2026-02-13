import circuitRepo from '../../api/repos/circuitRepo.js';
import { faker } from '@faker-js/faker';

export function createCircuitData(overrides = {}) {
	return {
		tz: faker.location.timeZone(),
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