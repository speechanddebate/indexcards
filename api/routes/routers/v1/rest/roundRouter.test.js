import request from 'supertest';
import server from '../../../../../app.js';

describe('GET /rounds', () => {
	it('Returns published rounds for a tourn when given valid id', async () => {
		const res = await request(server)
            .get(`/v1/rest/tourns/29807/rounds`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		const body = res.body;

		expect(Array.isArray(body)).toBe(true);
		expect(typeof body[0]).toBe('object');

		// Property test: every round must be published
		body.forEach((round) => {
			expect(round.published).toBe(1);
			expect(typeof round.id).toBe('number');
			expect(typeof round.eventId).toBe('number');
			expect(typeof round.Event.name).toBe('string');
			expect(typeof round.Event.abbr).toBe('string');
		});

		expect(body).toHaveLength(29);
	});
});
