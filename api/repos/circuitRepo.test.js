import { describe, it, expect } from 'vitest';
import circuitRepo, { circuitInclude} from './circuitRepo.js';
import factories from '../../tests/factories/index.js';


let sectionId = null;

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