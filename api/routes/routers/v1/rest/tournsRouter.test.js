import request from 'supertest';
import server from '../../../../../app.js';
import factories from '../../../../../tests/factories';
import { faker } from '@faker-js/faker';
import { File } from '../../../openapi/schemas';

let testTourn;
beforeAll(async () => {
	({tournId: testTourn } = await factories.tourn.createTestTourn());
	await factories.file.createTestFile({ tournId: testTourn, published: true });
});

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
		expect(body.length).toBeGreaterThan(0);
	});
});
describe('GET /rest/tourns/:id/files', () => {
	it('should return the files for a specific tourn', async () => {
		const res = await request(server)
            .get(`/v1/rest/tourns/${testTourn}/files`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		const body = res.body;
		body.forEach(element => {
			expect(element).toMatchSchema(File);
		});
	});
	it('should return 404 if the tourn does not exist', async () => {
		const res = await request(server)
            .get(`/v1/rest/tourns/9999/files`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

		expect(res).toBeProblemResponse(404);
	});
});

