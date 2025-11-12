import { assert } from 'chai';
import request from 'supertest';
import server from '../../../../app';

describe('Tournament Invitation Information', () => {

	// I haven't loaded up the sample data thing yet so for now I just want to
	// verify that I get SOME valid tournament from this API

	it('Lists upcoming tournaments', async () => {

		const res = await request(server)
			.get(`/v1/public/invite/upcoming`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

		const body = res.body;

		assert.typeOf(body    , 'array'  , 'Array returned');
		assert.typeOf(body[0] , 'object' , 'Array contains objects');

		assert.equal(body.length          , '10'         , 'I should have found eight tournaments.  Two are districts with 2 weekends each');
		assert.typeOf(body[0].tournId     , 'number'     , 'Object contains valid ID number');
		assert.typeOf(body[0].year        , 'number'     , 'Object contains valid year');
		assert.typeOf(body[0].sortnumeric , 'number'     , 'Object contains valid week number');
		assert.typeOf(body[0].name        , 'string'     , 'Object contains valid names');
		assert.equal(body[0].webname      , 'newengland' , `The first listed should be the New England district`);
	});
});

describe('Tournament Front Listing', () => {

	it('Lists upcoming tournaments', async () => {

		const res = await request(server)
			.get(`/v1/public/invite/upcoming`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

		const body = res.body;

		assert.typeOf(body    , 'array'  , 'Array returned');
		assert.typeOf(body[0] , 'object' , 'Array contains objects');

		assert.equal(body.length          , '10'         , 'I should have found eight tournaments.  Two are districts with 2 weekends each');
		assert.typeOf(body[0].tournId     , 'number'     , 'Object contains valid ID number');
		assert.typeOf(body[0].year        , 'number'     , 'Object contains valid year');
		assert.typeOf(body[0].sortnumeric , 'number'     , 'Object contains valid week number');
		assert.typeOf(body[0].name        , 'string'     , 'Object contains valid names');
		assert.equal(body[0].webname      , 'newengland' , `The first listed should be the New England district`);
	});
});

describe('getTournPublishedRounds Round List', () => {

	it('Lists upcoming tournaments', async () => {

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


