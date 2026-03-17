import request from 'supertest';
import server from '../../../../../app.js';
import factories from '../../../../../tests/factories/index.js';

describe('/rest/ads', () => {
	it('returns a list of ads for the homepage', async () => {
		//Arrange
		await factories.ad.createTestAd();

		//Act
		const res = await request(server)
            .get(`/v1/rest/ads`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		//Assert
		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body.length).toBeGreaterThanOrEqual(1);
		expect(res.body[0].url).toEqual(expect.any(String));
		expect(res.body[0].imgSrc).toEqual(expect.any(String));
		expect(res.body[0].background).toEqual(expect.any(String));
	});
});
