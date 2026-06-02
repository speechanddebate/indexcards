import db from '../data/db.js';
import { FIELD_MAP } from './mappers/quizMapper.js';
import { personQuizInclude } from './personQuizRepo.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function map(quiz) {
	if(quiz.person_quizzes) {
		quiz.PersonQuizzes = quiz.person_quizzes;
	}
	return quiz;
}

function buildQuizQuery(opts = {}) {

	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};

	if (opts.where) {
		query.where = { ...query.where, ...opts.where };
	}

	if (opts.include?.PersonQuizzes) {
		query.include.push({
			...personQuizInclude(opts.include.PersonQuizzes),
			as: 'person_quizzes',
			required: false,
		});
	}

	if (opts.limit) {
		query.limit = Number(opts.limit);
	}

	if (opts.offset) {
		query.offset = Number(opts.offset);
	}

	return query;
}

export function quizInclude(opts = {}) {
	return {
		model: db.quiz,
		as: 'quiz_quiz',
		...buildQuizQuery(opts),
	};
}

async function getQuizzes(opts = {}) {
	const quizzes = await db.quiz.findAll(buildQuizQuery(opts));
	return quizzes.map(map);
}

export default {
	getQuizzes,
};