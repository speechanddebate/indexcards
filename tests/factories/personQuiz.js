import personQuizRepo from '../../api/repos/personQuizRepo';
import factories from './index.js';

async function createData(overrides = {}) {
	return {
		hidden: false,
		pending: false,
		completed: true,
		approvedBy: null,
		...overrides,
	};
}
async function create(overrides = {}) {
	const data = await createData(overrides);
	if (!data.person) {
		const { personId } = await factories.person.create();
		data.person = personId;
	}
	if (!data.quiz) {
		const { quizId } = await factories.quiz.create({ person: data.person });
		data.quiz = quizId;
	}
	const personQuizId = await personQuizRepo.createPersonQuiz(data);
	return { personQuizId };
}

export default {
	create,
};