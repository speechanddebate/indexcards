import factories from '../../tests/factories';
import personQuizRepo from './personQuizRepo.js';

describe('PersonQuizRepo', () => {
	describe('createPersonQuiz', () => {
		it('creates a new PersonQuiz and returns its id', async () => {
			// Arrange
			const { personId } = await factories.person.createTestPerson();
			const { quizId } = await factories.quiz.createTestQuiz({ person: personId });
			const personQuizData = {
				person: personId,
				quiz: quizId,
				hidden: false,
				pending: false,
				completed: true,
				approvedBy: null,
			};
			// Act
			const personQuizId = await personQuizRepo.createPersonQuiz(personQuizData);

			// Assert
			expect(personQuizId).toBeDefined();
		});
	});
});