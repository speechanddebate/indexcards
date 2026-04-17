import db from '../../api/data/db.js';

function createQuizData(overrides = {}) {
	return {
		label: 'Test Quiz',
		description: 'This is a test quiz.',
		badgeDescription: 'Test Badge',
		badge: 'test_badge',
		badgeLink: 'https://example.com/test_badge.png',
		...overrides,
	};
}

async function createTestQuiz(overrides = {}) {
	const data = createQuizData(overrides);
	const newQuiz = await db.quiz.create(data);
	return {
		quizId: newQuiz.id,
	};
}

export default {
	createQuizData,
	createTestQuiz,
};