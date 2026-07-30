import request from 'supertest';
import server from '../../../../../app.js';
import factories from '../../../../../tests/factories/index.js';
import * as schemas from '../../../openapi/schemas/index.js';
import z from 'zod';


let personId : number;
let userkey: string;
beforeAll(async () => {
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

		expect(res.body).toMatchSchema(z.array(schemas.CurrentBallots));
	});
});