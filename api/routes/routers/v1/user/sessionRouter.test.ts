
import request from 'supertest';
import server from '../../../../../app.js';
import factories from '../../../../../tests/factories/index.js';
import * as schemas from '../../../openapi/schemas/index.js';

describe('Session Router', () => {
	let personId : number;
	let userkey: string;
	beforeAll(async () => {
		({ personId } = await factories.person.createTestPerson());
		({ userkey } = await factories.session.createTestSession({ person: personId }));
	});

	describe('GET /user/session', () => {
		it('Returns the current user session', async () => {

			const res = await request(server)
				.get('/v1/user/session')
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`)
				.expect('Content-Type', /json/)
				.expect(200);

			expect(res).not.toBeProblemResponse();
			expect(res.body).toMatchSchema(schemas.Session);
			expect(res.body).toHaveProperty('id');
			expect(res.body.Person).toHaveProperty('id', personId);
		});
		it('Returns 401 if not authenticated', async () => {
			await request(server)
				.get('/v1/user/session')
				.set('Accept', 'application/json')
				.expect(401);
		});
	});
});
