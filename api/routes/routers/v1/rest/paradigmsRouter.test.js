import request from 'supertest';
import server from '../../../../../app.js';
import factories from '../../../../../tests/factories/index.js';

describe('GET /rest/paradigms', () => {
	let Person, userkey;
	beforeAll(async () => {
		Person = await (await factories.person.createJudge({
			settings: {
				'paradigm': 'test',
			},
		})).getPerson();
		const { userkey: key } = await factories.session.createUser();
		userkey = key;
	});

	it('Returns paradigms with no params', async () => {
		const res = await request(server)
            .get(`/v1/rest/paradigms`)
			.set('Authorization', `Bearer ${userkey}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		const body = res.body;
		expect(body).toBeInstanceOf(Array);
		expect(body.length).toBeGreaterThan(0);
	});
	it('returns paradigms with search params', async () => {
		const res = await request(server)
            .get(`/v1/rest/paradigms?search="${Person.firstName} ${Person.lastName}"`)
			.set('Authorization', `Bearer ${userkey}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		const body = res.body;
		expect(body).toBeInstanceOf(Array);
		expect(body.length).toBeGreaterThan(0);
		expect(body.some(paradigm => paradigm.id == Person.id)).toBe(true);
	});
});
describe('GET /rest/paradigms/:personId', () => {
	let Person, userkey;
	beforeAll(async () => {
		Person = await (await factories.person.createJudge({
			settings: {
				'paradigm': 'test',
			},
		})).getPerson();
		const { userkey: key } = await factories.session.createUser();
		userkey = key;
	});

	it('Returns paradigm details for a specific person', async () => {
		const res = await request(server)
            .get(`/v1/rest/paradigms/${Person.id}`)
			.set('Authorization', `Bearer ${userkey}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		const body = res.body;
		expect(body).toBeInstanceOf(Object);
		expect(body.id).toBe(Person.id);
	});
});

