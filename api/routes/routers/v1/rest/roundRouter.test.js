import { assert } from 'chai';
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

        assert.typeOf(body, 'array', 'Array returned');
        assert.typeOf(body[0], 'object', 'Array contains objects');
        
        // Property test: every round must be published
        body.forEach((round, i) => {
            assert.strictEqual(
            round.published, 1, `Round at index ${i} is not published (value = ${round.published})`);
        });
        
        assert.equal(body.length, 29, 'I should have found 29 published rounds');
        
        assert.typeOf(body[0].roundId, 'number', 'Object contains valid round ID number');
        assert.typeOf(body[0].eventId, 'number', 'Object contains valid event ID number');
        assert.typeOf(body[0].eventName, 'string', 'Object contains valid event name');
        assert.equal(body[0].eventAbbr, 'DUO', 'The first listed event should be DUO');
        assert.equal(body[0].roundName, '4', 'The first listed round should be DUO Round 4');
	});
});
