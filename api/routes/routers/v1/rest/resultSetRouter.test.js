import request from 'supertest';
import server from '../../../../../app.js';
import { ResultSet, EventResultSets } from '../../../openapi/schemas/ResultSet.ts';
import z from 'zod';

describe('GET /results', () => {
	it('Returns result sets for a valid tournID', async () => {
		const res = await request(server)
            .get(`/v1/rest/tourns/31059/results`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		const body = res.body;
		expect(body).toMatchSchema(z.record(z.int(), EventResultSets));
	});

	it('Returns a particular result set for a valid tournID and rsID', async () => {
		const res = await request(server)
            .get(`/v1/rest/tourns/31059/results/329545`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		const body = res.body;
		expect(body).toMatchSchema(z.array(ResultSet));

		// Property test: every result set must be published
		//expect(body.published).toBe(1); deleted published from the repo result?
		expect(typeof body.Results).toBe('object');
		expect(typeof body.event).toBe('number');
		expect(Object.keys(body.Results)).toHaveLength(160);
	});
});
