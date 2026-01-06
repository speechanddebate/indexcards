import { assert } from 'chai';
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
		assert.typeOf(res.body, 'array', 'Array returned');
		assert.isAtLeast(res.body.length, 1, 'At least one ad returned');
		assert.typeOf(res.body[0].id, 'number', 'id of ad is a number');
		assert.typeOf(res.body[0].filename, 'string', 'filename of ad is a string');
		assert.typeOf(res.body[0].url, 'string', 'URL of ad is a string');
	});
});
