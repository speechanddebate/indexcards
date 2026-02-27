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

	if(opts.include?.Quiz){
		query.include.push({
			...quizInclude(opts.include.Quiz),
			as: 'personQuiz_quiz',
		});
	}

	//return only published and not hidden quizzes
	if(opts.isValid) {
		query.where.hidden = false;
		query.where.pending = false;
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
		as: 'personQuizzes',
		...buildPersonQuizQuery(opts),
	};
}