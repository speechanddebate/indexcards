import factories from '../../../../../tests/factories/index.js';
import request from 'supertest';
import server from '../../../../../app.js';
import z from 'zod';
import { JudgeHistory } from '../../../openapi/schemas/index.ts';

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
			//make the request to claim the chapter judge
			const res = await request(server)
				.post('/v1/user/judges/claim')
				.query({ chapterJudgeId })
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`)
				.expect(200);
			//assert that the chapter judge's person_request is updated and that an email was sent to the chapter email with the correct content
			const updatedChapterJudge = await getChapterJudge();
			expect(updatedChapterJudge.person_request).toBe(personId);
		});
		it('should auto-approve a claim request if the user is a chapter admin', async () => {
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
				.expect(200);
			//assert that the chapter judge's person_request is updated and that an email was sent to the chapter email with the correct content
			const updatedChapterJudge = await getChapterJudge();
			expect(updatedChapterJudge.person).toBe(personId);
		});
		it.todo('should allow a user to claim a judge', async () => {
			//setup - create a judge with no person_request
			//make the request to claim the judge
			//assert that the judge's person_request is updated and that an email was sent to the chapter email with the correct content
		});
	});
	describe("GET /user/judges/history", () => {
		it('should return the judge history for the logged in user', async () => {
			const { tournId } = await factories.tourn.createTestTourn(); // start is past by default
			const { categoryId } = await factories.category.createTestCategory({ tourn: tournId });
			const { judgeId } = await factories.judge.createTestJudge({ person: personId, category: categoryId });

			// Create event → round → panel → ballot chain
			const { eventId } = await factories.event.create({ category: categoryId });
			const { roundId } = await factories.round.create({ event: eventId, published: true });
			const { sectionId } = await factories.section.create({ round: roundId });
			await factories.ballot.create({ sectionId, judgeId });
			
			const res = await request(server)
				.get('/v1/user/judges/history')
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`)
				.expect(200);
			expect(res.body).toMatchSchema(z.array(JudgeHistory));
		});
	});
	describe("POST /user/judges/paradigm", () => {
		it('should update the users paradigm', async () => {
			const { personId, getPerson } = await factories.person.create();
			const { userkey } = await factories.session.createTestSession({ person: personId });
			const res = await request(server)
				.post('/v1/user/judges/paradigm')
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`)
				.send({ paradigm: 'word '.repeat(50) })
				.expect(204);
			expect(res).not.toBeProblemResponse();

			const updatedPerson = await getPerson() as { settings: { paradigm: string } };
			expect(updatedPerson.settings.paradigm).toBe('word '.repeat(50));

			const newParadigm = await request(server)
				.get('/v1/user/judges/paradigm')
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`)
				.expect(200);
			expect(newParadigm.body.paradigm).toBe('word '.repeat(50));
		});
	});
});