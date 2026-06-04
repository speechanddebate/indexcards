import db from '../data/db.js';
import { FIELD_MAP } from './mappers/personQuizMapper.js';
import { quizInclude } from './quizRepo.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildPersonQuizQuery(opts = {}) {

	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};

	if (opts.where) {
		query.where = { ...query.where, ...opts.where };
	}

	if(opts.include?.Quiz){
		query.include.push({
			as: 'quiz_quiz',
			...quizInclude(opts.include.Quiz),
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

export function personQuizInclude(opts = {}) {
	return {
		model: db.personQuiz,
		as: 'person_quizzes',
		...buildPersonQuizQuery(opts),
	};
}

async function createPersonQuiz(data) {
	const newPersonQuiz = await db.personQuiz.create(data);
	return newPersonQuiz.id;
}

export default {
	createPersonQuiz,
};