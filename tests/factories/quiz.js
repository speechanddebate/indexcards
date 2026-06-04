import db from '../../api/data/db.js';
import factories from './index.js';

function createQuizData(overrides = {}) {
	return {
		label: 'Test Quiz',
		description: 'This is a test quiz.',
		sitewide: true,
		hidden: false,
		approval: true,
		show_answers: false,
		admin_only: false,
		badge_description: 'Test Badge',
		badge: 'test_badge',
		badge_link: 'https://example.com/test_badge.png',
		...overrides,
	};
}

async function create(overrides = {}) {
	const data = createQuizData(overrides);
	if (!data.person) {
		const { personId } = await factories.person.create();
		data.person = personId;
	}
	const newQuiz = await db.quiz.create(data);
	return {
		quizId: newQuiz.id,
	};
}

export default {
	createQuizData,
	create,
};