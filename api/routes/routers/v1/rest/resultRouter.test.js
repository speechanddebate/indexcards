import request from 'supertest';
import server from '../../../../../app.js';

describe('GET /results', () => {
	it('Returns published result sets for a tourn when given valid id', async () => {
		const res = await request(server)
            .get(`/v1/rest/tourns/30661/results/338245`)
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

		expect(body.Results).toHaveLength(50);
	});
});
