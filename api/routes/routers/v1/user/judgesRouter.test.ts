import factories from '../../../../../tests/factories/index.js';
import request from 'supertest';
import server from '../../../../../app.js';
import z from 'zod';

describe('judgesRouter', () => {
	let personId : number;
	let userkey: string;
	beforeAll(async () => {
		({ personId } = await factories.person.create());
		({ userkey } = await factories.session.createTestSession({ person: personId }));
	});
	describe("POST /user/judges/claim", () => {
		it('should allow a user to claim a chapter judge', async () => {
			//setup - create a chapter judge with no person_request
			const { chapterId } = await factories.chapter.create();
			const { chapterJudgeId, getChapterJudge } = await factories.chapterJudge.create({
				person_request: null,
				chapter: chapterId,
			});
			await factories.permission.create({ person: personId, chapter: chapterId, tag: 'chapter' }); //give the user admin permissions for the chapter so they can receive the notification email
			//make the request to claim the chapter judge
			const res = await request(server)
				.post('/v1/user/judges/claim')
				.query({ chapterJudgeId })
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`)
				.expect(204);
			//assert that the chapter judge's person_request is updated and that an email was sent to the chapter email with the correct content
			const updatedChapterJudge = await getChapterJudge();
			expect(updatedChapterJudge.person_request).toBe(personId);
		});
		it('should allow a user to claim a judge', async () => {
			//setup - create a judge with no person_request
			//make the request to claim the judge
			//assert that the judge's person_request is updated and that an email was sent to the chapter email with the correct content
		});
	});
});