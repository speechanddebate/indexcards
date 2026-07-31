import request from 'supertest';
import server from '../../../../../app.js';
import factories from '../../../../../tests/factories/index.js';
import * as schemas from '../../../openapi/schemas/index.js';
import z from 'zod';


let personId : number;
let userkey: string;
beforeEach(async () => {
	({ personId } = await factories.person.create());
	({ userkey } = await factories.session.createTestSession({ person: personId }));
});

describe('GET /user/sections/current', () => {
	it('Returns the current user ballots', async () => {
		await factories.person.createBallot({personId});

		const res = await request(server)
			.get('/v1/user/sections/current')
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${userkey}`)
			.expect('Content-Type', /json/)
			.expect(200);

		expect(res.body).toMatchSchema(z.array(schemas.CurrentBallot));
	});
	it('Does not return ballots for unpublished rounds or rounds with judges_ballots_visible set to false', async () => {
		await factories.person.createBallot({personId, Round: { published: false} });
		const res = await request(server)
			.get('/v1/user/sections/current')
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${userkey}`)
			.expect('Content-Type', /json/)
			.expect(200);

		expect(res.body).toMatchSchema(z.array(schemas.CurrentBallot));
		expect(res.body).toHaveLength(0);

		await factories.person.createBallot({personId, Round: { settings: { judges_ballots_visible: false } } });
		const res2 = await request(server)
			.get('/v1/user/sections/current')
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${userkey}`)
			.expect('Content-Type', /json/)
			.expect(200);

		expect(res2.body).toMatchSchema(z.array(schemas.CurrentBallot));
		expect(res2.body).toHaveLength(0);
	});
	it('Does not return audited ballots', async () => {
		await factories.person.createBallot({personId, Ballot: { audit: 1 }, Event: { type: 'debate' } });

		const res = await request(server)
			.get('/v1/user/sections/current')
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${userkey}`)
			.expect('Content-Type', /json/)
			.expect(200);

		expect(res.body).toMatchSchema(z.array(schemas.CurrentBallot));
		expect(res.body).toHaveLength(0);

	});
	it('Returns audited ballots for current Mock Trial and Congress chairs', async () => {
		await factories.person.createBallot({personId, 
			Ballot: { audit: 1, chair: 1 }, 
			Event: { type: 'mock_trial' }
		});
		const res = await request(server)
			.get('/v1/user/sections/current')
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${userkey}`)
			.expect('Content-Type', /json/)
			.expect(200);
			
		expect(res.body).toMatchSchema(z.array(schemas.CurrentBallot));
		expect(res.body).toHaveLength(1);

		await factories.person.createBallot({personId, 
			Ballot: { audit: 1, chair: 1 }, 
			Event: { type: 'congress' }
		 });
		const res2 = await request(server)
			.get('/v1/user/sections/current')
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${userkey}`)
			.expect('Content-Type', /json/)
			.expect(200);
			
		expect(res2.body).toMatchSchema(z.array(schemas.CurrentBallot));
		expect(res2.body).toHaveLength(2); //includes the MT one from earlier
	});
	it('does not return async ballots past the deadline', async () => {
		const pastDeadline = Date.now() - 1000;
		await factories.person.createBallot({personId, Timeslot: { end: pastDeadline }, Event: { settings: { online_mode: 'async' } } });

		const res = await request(server)
			.get('/v1/user/sections/current')
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${userkey}`)
			.expect('Content-Type', /json/)
			.expect(200);

		expect(res.body).toMatchSchema(z.array(schemas.CurrentBallot));
		expect(res.body).toHaveLength(0);
	});
});