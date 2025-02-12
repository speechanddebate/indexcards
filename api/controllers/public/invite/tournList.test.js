import { assert } from 'chai';
import request from 'supertest';
import server from '../../../../app';

describe('Tournament Front Listing', () => {

	// I haven't loaded up the sample data thing yet so for now I just want to
	// verify that I get SOME valid tournament from this API

	it('Lists upcoming tournaments', async () => {

		const res = await request(server)
			.get(`/v1/public/invite/upcoming`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

		const body = res.body;

		assert.typeOf(body, 'array', 'Array returned');
		assert.typeOf(body[0], 'object', 'Array contains objects');

		assert.equal(body.length, '10', 'I should have found eight tournaments.  Two are districts with 2 weekends each');
		assert.typeOf(body[0].id   , 'number' , 'Object contains valid ID number');
		assert.typeOf(body[0].year , 'number' , 'Object contains valid year');
		assert.typeOf(body[0].week , 'number' , 'Object contains valid week number');
		assert.typeOf(body[0].name , 'string' , 'Object contains valid names');
		assert.equal(body[0].webname, 'texasopen', `The first listed should be the Texas Open`);
	});
});
