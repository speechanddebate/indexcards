import request from 'supertest';
import { assert } from 'chai';
import server from '../../../../app.js';
import factories from "../../../../tests/factories/index.js";
import { hashPassword } from '../../../services/AuthService.js';


describe('Auth Router', () => {
	describe('/register' , () => {
		it('Registers a new user', async () => {
			const personData = await factories.person.createPersonData({
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
			assert.containsAllKeys(res.body, ['person', 'token'], 'Response has person object and session token');
		});
	});
});