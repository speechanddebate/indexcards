
import circuitRepo, { circuitInclude} from './circuitRepo.js';
import { faker } from '@faker-js/faker';
import factories from '../../tests/factories';

describe('circuitRepo', () => {
	describe('buildCircuitQuery', () => {
		it('does not include associations by default', async () => {
			const circuitId = await circuitRepo.createCircuit();

			const circuits = await circuitRepo.getCircuits();
			const circuit = circuits.find(b => b.id === circuitId);

			expect(circuit).toBeDefined();
			expect(circuit.judge).toBeUndefined();
			expect(circuit.section).toBeUndefined();
			expect(circuit.scores).toBeUndefined();
		});
		it('includes tourns when requested', async () => {
			const circuitId = await circuitRepo.createCircuit();
			const circuit = await circuitRepo.getCircuit(
				circuitId,
				{ include: { tourns: true } }
			);

			expect(circuit).toBeDefined();
			expect(circuit.tourns).toBeDefined();
			expect(Array.isArray(circuit.tourns)).toBe(true);
		});
		it('includes settings when requested', async () => {
			const settings = { exampleSetting: 'exampleValue' };
			const circuitId = await circuitRepo.createCircuit({ settings });
			const circuit = await circuitRepo.getCircuit(
				circuitId,
				{ settings: true }
			);

			expect(circuit).toBeDefined();
			expect(circuit.settings).toBeDefined();
			expect(circuit.settings.exampleSetting).toBe('exampleValue');
		});
	});
	describe('circuitInclude', () => {
		it('returns base circuit include config', () => {
			const inc = circuitInclude();
			expect(inc.model).toBeDefined();
			expect(Array.isArray(inc.include)).toBe(true);
		});
	});
	describe('getCircuits', async () => {

		it('should return an empty array if no circuits exist for a tourn', async () => {
			const circuits = await circuitRepo.getCircuits({ tournId: 999999 }); // unlikely sectionId
			expect(Array.isArray(circuits)).toBe(true);
			expect(circuits.length).toBe(0);
		});

		it('should return circuits for a given circuitId', async () => {
			const circuitId = await circuitRepo.createCircuit();
			const circuits = await circuitRepo.getCircuits();
			expect(Array.isArray(circuits)).toBe(true);
			expect(circuits.length).toBeGreaterThan(0);
			const found = circuits.find(b => b.id === circuitId);
			expect(found).toBeDefined();
		});
	});
	describe('getActiveCircuits', () => {
		it('should return active circuits within a date range', async () => {
			const { circuitId } = await factories.circuit.createTestCircuit();
			await factories.tourn.createTestTourn({ circuit: circuitId, start: new Date() });
			await factories.tourn.createTestTourn({ circuit: circuitId, start: new Date() });
			const circuits = await circuitRepo.getActiveCircuits({ startDate: faker.date.past(), endDate: faker.date.future() });
			expect(Array.isArray(circuits)).toBe(true);
			const circuit = circuits.find(c => c.id === circuitId);

			expect(circuit).toBeDefined();
			expect(circuit.tourns).toBe(2);

		});
		it('should apply state and country filters', async () => {
			const { circuitId: noLocale } = await factories.circuit.createTestCircuit();
			await factories.tourn.createTestTourn({ circuit: noLocale, start: new Date() });
			const { circuitId: rightState } = await factories.circuit.createTestCircuit({ state: 'MN', country: 'US'});
			await factories.tourn.createTestTourn({ circuit: rightState, start: new Date() });
			const { circuitId: wrongState } = await factories.circuit.createTestCircuit({ state: 'WI', country: 'US'});
			await factories.tourn.createTestTourn({ circuit: wrongState, start: new Date() });
			const { circuitId: wrongCountry } = await factories.circuit.createTestCircuit({ state: 'MN', country: 'CA'});
			await factories.tourn.createTestTourn({ circuit: wrongCountry, start: new Date() });

			let res = await circuitRepo.getActiveCircuits({
				startDate: faker.date.past(),
				endDate: faker.date.future(),
				state: 'MN',
				country: 'US',
			});
			expect(res).toBeDefined();
			//expect to contain rightState and none of the others
			expect(res.some(c => c.id === rightState)).toBe(true);
			expect(res.some(c => c.id === noLocale)).toBe(false);
			expect(res.some(c => c.id === wrongState)).toBe(false);
			expect(res.some(c => c.id === wrongCountry)).toBe(false);

			res = await circuitRepo.getActiveCircuits({
				startDate: faker.date.past(),
				endDate: faker.date.future(),
				country: 'US',
			});
			expect(res).toBeDefined();
			expect(res.some(c => c.id === rightState)).toBe(true);
			expect(res.some(c => c.id === noLocale)).toBe(false);
			expect(res.some(c => c.id === wrongState)).toBe(true);
			expect(res.some(c => c.id === wrongCountry)).toBe(false);

			res = await circuitRepo.getActiveCircuits({
				startDate: faker.date.past(),
				endDate: faker.date.future(),
				state: 'WI',
			});
			expect(res).toBeDefined();
			expect(res.some(c => c.id === rightState)).toBe(false);
			expect(res.some(c => c.id === noLocale)).toBe(false);
			expect(res.some(c => c.id === wrongState)).toBe(true);
			expect(res.some(c => c.id === wrongCountry)).toBe(false);
		});
		it('does not return circuits outside the date range', async () => {
			const { circuitId } = await factories.circuit.createTestCircuit();
			await factories.tourn.createTestTourn({ circuit: circuitId, start: new Date() });
			const circuits = await circuitRepo.getActiveCircuits({ startDate: faker.date.future(), endDate: faker.date.future() });
			expect(circuits.some(c => c.id === circuitId)).toBe(false);
		});
		it('throws an error if startDate or endDate is missing', async () => {
			await expect(circuitRepo.getActiveCircuits({ startDate: faker.date.past() })).rejects.toThrow('getActiveCircuits: startDate and endDate are required');
			await expect(circuitRepo.getActiveCircuits({ endDate: faker.date.future() })).rejects.toThrow('getActiveCircuits: startDate and endDate are required');
			await expect(circuitRepo.getActiveCircuits()).rejects.toThrow('getActiveCircuits: startDate and endDate are required');
		});

	});

	describe('createCircuit', async () => {
		it('should create a circuit and retrieve it', async () => {
			const circuitId = await circuitRepo.createCircuit();
			const circuit = await circuitRepo.getCircuit(circuitId);

			//ensure that id, updatedAt and createdAt are present and not null
			expect(circuit).toHaveProperty('id');
			expect(circuit.id).not.toBeNull();
			expect(circuit).toHaveProperty('updatedAt');
			expect(circuit.updatedAt).not.toBeNull();
			expect(circuit).toHaveProperty('createdAt');
			expect(circuit.createdAt).not.toBeNull();
		});
		it('should create a circuit with settings and retrieve it', async () => {
			const settings = { exampleSetting: 'exampleValue' };
			const circuitId = await circuitRepo.createCircuit({ settings });
			const circuit = await circuitRepo.getCircuit(
				circuitId,
				{ settings: true }
			);

			expect(circuit).toBeDefined();
			expect(circuit.settings).toBeDefined();
			expect(circuit.settings.exampleSetting).toBe('exampleValue');
		});
	});

});