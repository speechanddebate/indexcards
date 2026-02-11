import request from 'supertest';
import server from '../../../../../app.js';
import db from '../../../../data/db.js';

describe('Current ads', () => {
	it('returns a list of ads', async () => {
		//Arrange
		await db.ad.create({
			filename : 'testad.jpg',
			url      : 'http://example.com/ad',
			person   : 1,
			approved_by : 1,
			approved : true,
			start: new Date(Date.now() - 60 * 1000), // 1 min ago
			end:   new Date(Date.now() + 60 * 1000), // 1 min in the future
		});

		//Act
		const res = await request(server)
            .get(`/v1/rest/ads/published`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		//Assert
		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body.length).toBeGreaterThanOrEqual(1);
		expect(res.body[0].id).toEqual(expect.any(Number));
		expect(res.body[0].filename).toEqual(expect.any(String));
		expect(res.body[0].url).toEqual(expect.any(String));
	});
});
