import request from 'supertest';
import server from '../../../../../app.js';
import factories from '../../../../../tests/factories';
import { faker } from '@faker-js/faker';

describe('GET /rest/tourns', () => {
	it('Returns the correct shape for the circuit calendar request', async () => {
		//create a circuit and tourn
		const startBefore = faker.date.future();
		const startAfter = faker.date.past();
		const tournDate = faker.date.between({from: startAfter, to: startBefore});
		const { circuitId } = await factories.circuit.createTestCircuit();
		const { tournId } = await factories.tourn.createTestTourn({ circuit: circuitId, start: tournDate });
		await factories.event.createTestEvent({ tournId, abbr: 'ABBR' });
		const res = await request(server)
            .get(`/v1/rest/tourns?circuit=${circuitId}&startAfter=${startAfter.toISOString()}&startBefore=${startBefore.toISOString()}&fields[events]=abbr,type&limit=10`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		const body = res.body;
		expect(body).toBeDefined();
		//expect an array
		expect(Array.isArray(body)).toBe(true);
		const tourn = body.find(t => t.id === tournId);
		expect(tourn).toBeDefined();
		expect(tourn.Events).toBeDefined();
		expect(tourn.Events.some(e => e.abbr === 'ABBR')).toBe(true);
		expect(tourn.Events.some(e => e.type)).toBe(true);
	});
	it('Returns the correct shape for the results request', async () => {
		//create a circuit and tourn
		const startBefore = faker.date.future();
		const startAfter = faker.date.past();
		const tournDate = faker.date.between({from: startAfter, to: startBefore});
		const { tournId } = await factories.tourn.createTestTourn({ start: tournDate });
		await factories.resultSet.createTestResultSet({ tourn: tournId, published: 1 });
		const res = await request(server)
            .get(`/v1/rest/tourns?startAfter=${startAfter.toISOString()}
				&startBefore=${startBefore.toISOString()}
				&limit=10
				&publishedResults=true`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		const body = res.body;
		expect(body).toBeDefined();
		//expect an array
		expect(Array.isArray(body)).toBe(true);
		const tourn = body.find(t => t.id === tournId);
		expect(tourn).toBeDefined();
	});
});
