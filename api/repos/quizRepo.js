import db from '../data/db.js';
import { FIELD_MAP } from './mappers/quizMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildQuizQuery(opts = {}) {

	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};

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
		as: 'quiz',
		...buildQuizQuery(opts),
	};
}