import request from 'supertest';
import server from '../../../../../app.js';
import factories from '../../../../../tests/factories/index.js';
import { activeCircuitsResponse, restCircuit } from '../../../openapi/schemas/Circuit.js';

describe('GET /rest/circuits/active', () => {
	it('Returns active circuits for the current school year', async () => {
		const { circuitId } = await factories.circuit.createTestCircuit();
		await factories.tourn.createTestTourn({ circuit: circuitId, start: new Date() });
		await factories.tourn.createTestTourn({ circuit: circuitId, start: new Date() });
		const res = await request(server)
            .get(`/v1/rest/circuits/active`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		const body = res.body;
		expect(body).toMatchSchema(activeCircuitsResponse);
	});
});
describe('GET /rest/circuits/:circuitId', () => {
	it('Returns a specific circuit by ID', async () => {
		const { circuitId } = await factories.circuit.createTestCircuit();
		const res = await request(server)
            .get(`/v1/rest/circuits/${circuitId}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		const body = res.body;
		expect(body).toMatchSchema(restCircuit);
	});
});

