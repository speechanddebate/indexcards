import request from 'supertest';
import server from '../../../../../app.js';
import factories from '../../../../../tests/factories/index.js';

describe('coachRouter', () => {
	let userkey;
	beforeAll(async () => {
		({ userkey } = await factories.session.createTestSession({ Person: {siteAdmin: true} }));
	});
	describe('/:chapterId/school/:schoolId/updateContact', async () => {
		it('does not explode', async () => {
			const res = await request(server)
				.post('/v1/coach/4/school/4/updateContact')
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`)
				.send({
					school: 4,
					person: 4,
				})
				.expect('Content-Type', /json/)
				.expect(200);

			expect(res).not.toBeProblemResponse();
		});
	});
});