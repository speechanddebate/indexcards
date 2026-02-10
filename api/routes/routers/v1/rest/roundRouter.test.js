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
            // IDs and names
            assert.typeOf(round.id, 'number', `Round at index ${i} contains valid round Id`);
            assert.typeOf(round.eventId, 'number', `Round at index ${i} contains valid event Id`);
            assert.typeOf(round.event.name, 'string', `Round at index ${i} contains valid event Name`);
            assert.typeOf(round.event.abbr, 'string', `Round at index ${i} contains valid event Abbr`);
        
        });
        assert.equal(body.length, 29, 'I should have found 29 published rounds');

	});
});
