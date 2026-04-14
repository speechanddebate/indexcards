import request from 'supertest';
import server from '../../../../../app.js';

describe('GET /results', () => {
	it('Returns published result sets for a valid tournID', async () => {
		const res = await request(server)
            .get(`/v1/rest/tourns/31059/results`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		const body = res.body;
		expect(Array.isArray(body)).toBe(true);
		expect(typeof body[0]).toBe('object');

		// Property test: every result set must be published
		body.forEach((result) => {
			expect(result.published).toBe(1);
			expect(typeof result.id).toBe('number');
			expect(typeof result.event).toBe('number');
		});
	});

	it('Returns a particular published result set for a valid tournID and rsID', async () => {
		const res = await request(server)
            .get(`/v1/rest/tourns/31059/results/329545`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		const body = res.body;
		expect(typeof body).toBe('object');

		// Property test: every result set must be published
		expect(body.published).toBe(1);
		expect(typeof body.Results).toBe('object');
		expect(typeof body.event).toBe('number');
		expect(Object.keys(body.Results)).toHaveLength(160);
	});
});
