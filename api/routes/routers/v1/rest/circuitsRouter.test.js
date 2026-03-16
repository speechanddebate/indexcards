import request from 'supertest';
import server from '../../../../../app.js';
import factories from '../../../../../tests/factories/index.js';

describe('GET /rest/circuits/active', () => {
	it('Returns active circuits for the current school year', async () => {
		const { circuitId, getCircuit } = await factories.circuit.createTestCircuit();
		await factories.tourn.createTestTourn({ circuit: circuitId, start: new Date() });
		await factories.tourn.createTestTourn({ circuit: circuitId, start: new Date() });
		const res = await request(server)
            .get(`/v1/rest/circuits/active`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		const body = res.body;

		expect(Array.isArray(body)).toBe(true);
		expect(typeof body[0]).toBe('object');

		// Property test: every circuit must have required properties
		body.forEach((circuit) => {
			expect(typeof circuit.id).toBe('number');
			expect(typeof circuit.abbr).toBe('string');
			expect(typeof circuit.name).toBe('string');
			expect(typeof circuit.state).toBe('string');
			expect(typeof circuit.country).toBe('string');
			expect(typeof circuit.tournCount).toBe('number');
		});
		const circuitData = await getCircuit();
		const circuit = body.find(c => c.id === circuitId);
		expect(circuit).toBeDefined();
		expect(circuit.name).toBe(circuitData.name);
		expect(circuit.abbr).toBe(circuitData.abbr);
		expect(circuit.state).toBe(circuitData.state);
		expect(circuit.country).toBe(circuitData.country);
		expect(circuit.tournCount).toBe(2);

	});
});
