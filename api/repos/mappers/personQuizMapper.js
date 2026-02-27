import { toDomain as genericToDomain, toPersistence as genericToPersistence, toBool, fromBool } from './mapperUtils.js';
import { toDomain as quizToDomain } from './quizMapper.js';

export const FIELD_MAP = {
	id: 'id',
	hidden: { db: 'hidden', toDomain: toBool, toDb: fromBool },
	pending: { db: 'pending', toDomain: toBool, toDb: fromBool },
	approvedBy: { db: 'approved_by' },
	completed: { db: 'completed', toDomain: toBool, toDb: fromBool },
	answers: 'answers',
	updatedAt: { db: 'updated_at', toDb: () => undefined },
	createdAt: { db: 'created_at', toDb: () => undefined },
	personId: { db: 'person' },
	quizId: { db: 'quiz' },
};

export const toDomain = dbRow => {
	if (!dbRow) return null;
	const personQuiz = genericToDomain(dbRow, FIELD_MAP);
	if (dbRow.personQuiz_quiz) {
		personQuiz.Quiz = quizToDomain(dbRow.personQuiz_quiz);
	}
	return personQuiz;
};
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};