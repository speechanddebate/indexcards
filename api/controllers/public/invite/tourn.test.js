import { assert } from 'chai';
import request from 'supertest';
import server from '../../../../app';

describe('getTournByWebname Human to ID', () => {
	it('Returns the proper tournament given a webname string', async () => {
		const res = await request(server)
			.get(`/v1/public/invite/webname/newengland`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

		const body = res.body;
		assert.typeOf(body, 'object');
		assert.equal(body.tournId, 29714);
	});
});

describe('getTournPublishedRounds Round List', () => {
	it('Lists out published rounds for a tournament', async () => {
		const res = await request(server)
			.get(`/v1/public/invite/29807/rounds`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

		const body = res.body;
		const unpublishedRounds = body.filter( (round) =>  round.published < 1 );

		assert.typeOf(body    , 'array'  , 'Array returned');
		assert.typeOf(body[0] , 'object' , 'Array contains objects');

		assert.equal(body.length              , '29' , 'I should have found 32 published rounds');
		assert.equal(unpublishedRounds.length , '0'  , 'I should have found zero unpublished rounds');

		assert.typeOf(body[0].roundId   , 'number' , 'Object contains valid round ID number');
		assert.typeOf(body[0].eventId   , 'number' , 'Object contains valid event ID number');
		assert.typeOf(body[0].eventName , 'string' , 'Object contains valid event name');
		assert.equal(body[0].eventAbbr  , 'DUO'     , `The first listed event should be DI`);
		assert.equal(body[0].roundName  , '4'      , `The first listed round should be DI Round 4`);
	});
});
