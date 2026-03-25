import request from 'supertest';
import server from '../../../../app.js';
import factories from '../../../../tests/factories/index.js';
import sessionRepo from '../../../repos/sessionRepo.js';
import { hashPassword } from '../../../services/AuthService.js';

describe('Auth Router', () => {
	describe('/login' , () => {
		it('Logs in an existing user', async () => {
			const password = 'securepassword';
			const person = await (await factories.person.createTestPerson({
				password: hashPassword('securepassword'),
			})).getPerson();

			const res = await request(server)
				.post('/v1/auth/login')
				.send({
					username: person.email,
					password: password,
				})
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200);
			assert.isObject(res.body, 'Response is an object');
			assert.containsAllKeys(res.body, ['Person', 'token'], 'Response has person object and session token');
		});
		it('Fails to log in with incorrect password', async () => {
			const person = await (await factories.person.createTestPerson({
				password: hashPassword('securepassword'),
			})).getPerson();

			const res = await request(server)
				.post('/v1/auth/login')
				.send({
					username: person.email,
					password: 'wrongpassword',
				})
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/);

			expect(res).toBeProblemResponse(401);
		});
		it('returns 400 for missing credentials', async () => {
			const res = await request(server)
				.post('/v1/auth/login')
				.send({})
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/);

			expect(res).toBeProblemResponse(400);
		});
	});
	describe('/logout', () => {
		it('logs out an existing user', async () => {
			const person = await (await factories.person.createTestPerson({
				password: hashPassword('securepassword'),
			})).getPerson();

			const loginRes = await request(server)
				.post('/v1/auth/login')
				.send({
					username: person.email,
					password: 'securepassword',
				})
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200);

			const token = loginRes.body.token;

			await request(server)
				.post('/v1/auth/logout')
				.set('Authorization', `Bearer ${token}`)
				.expect(204);

			const session = await sessionRepo.findByUserKey(token);
			expect(session).toBeNull();
		});

	});
	describe('/register' , () => {
		it('Registers a new user', async () => {
			const personData = factories.person.createPersonData({
				password: 'securepassword',
			});
			const res = await request(server)
				.post('/v1/auth/register')
				.send({
					email: personData.email,
					password: personData.password,
					firstName: personData.firstName,
					lastName: personData.lastName,
				})
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200);
			assert.isObject(res.body, 'Response is an object');
			assert.containsAllKeys(res.body, ['personId', 'token'], 'Response has personId and session token');
		});
	});

});