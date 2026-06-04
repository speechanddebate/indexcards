import request from 'supertest';
import server from '../../../../../app.js';
import z from 'zod';
import { Quiz } from '../../../openapi/schemas/Quiz.ts';
import factories from '../../../../../tests/factories/index.js';

describe('Quizzes Router', () => {
  describe('GET /rest/quizzes', () => {
	it('should return a list of quizzes', async () => {
	  const response = await request(server)
	  .get('/v1/rest/quizzes');
	  expect(response.status).toBe(200);
	  expect(response.body).toMatchSchema(z.array(Quiz));
	});
	it('should not return hidden, non-sitewide, or admin-only quizzes', async () => {
		const { quizId: hiddenQuizId } = await factories.quiz.create({
			hidden: true,
		});
		const { quizId: nonSitewideQuizId } = await factories.quiz.create({
			sitewide: false,
		});
		const { quizId: adminOnlyQuizId } = await factories.quiz.create({
			admin_only: true,
		});
	  const response = await request(server)
	  .get('/v1/rest/quizzes');
	  expect(response.status).toBe(200);
	  expect(response.body).toMatchSchema(z.array(Quiz));
	  const quizIds = response.body.map((quiz: any) => quiz.id);
	  expect(quizIds).not.toContain(hiddenQuizId);
	  expect(quizIds).not.toContain(nonSitewideQuizId);
	  expect(quizIds).not.toContain(adminOnlyQuizId);
 	});
	it('should attach the personQuiz if a person is authenticated', async () => {
		const { personId, userkey } = await factories.session.createTestSession();
		const { quizId } = await factories.quiz.create();
		await factories.personQuiz.create({
			person: personId,
			quiz: quizId,
		});
		const response = await request(server)
		.get('/v1/rest/quizzes')
		.set('Authorization', `Bearer ${userkey}`);
		expect(response.status).toBe(200);
		expect(response.body).toMatchSchema(z.array(Quiz));
		const quiz = response.body.find((q: any) => q.id === quizId);
		expect(quiz).toBeDefined();
		expect(quiz.PersonQuizzes).toBeDefined();
		expect(quiz.PersonQuizzes.length).toBe(1);
		expect(quiz.PersonQuizzes[0].person).toBe(personId);
		expect(quiz.PersonQuizzes[0].quiz).toBe(quizId);
	});	
});
});