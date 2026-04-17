import personQuizRepo from '../../api/repos/personQuizRepo';

async function createTestPersonQuiz(overrides = {}) {
	const defaultData = {
		person: null, // should be set to a valid personId
		quiz: null, // should be set to a valid quizId
		hidden: false,
		pending: false,
		completed: true,
		approvedBy: null,
	};
	const data = { ...defaultData, ...overrides };
	const personQuizId = await personQuizRepo.createPersonQuiz(data);
	return { personQuizId };
}

export default {
	createTestPersonQuiz,
};