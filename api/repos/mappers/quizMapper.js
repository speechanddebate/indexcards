import { toDomain as genericToDomain, toPersistence as genericToPersistence, toBool, fromBool } from './mapperUtils.js';

export const FIELD_MAP = {
	id: 'id',
	tag: 'tag',
	label: 'label',
	questions: 'questions',
	description: 'description',
	sitewide: { db: 'sitewide', toDomain: toBool, toDb: fromBool },
	hidden: { db: 'hidden', toDomain: toBool, toDb: fromBool },
	approval: { db: 'approval', toDomain: toBool, toDb: fromBool },
	showAnswers: { db: 'show_answers', toDomain: toBool, toDb: fromBool },
	adminOnly: { db: 'admin_only', toDomain: toBool, toDb: fromBool },
	badge: 'badge',
	badgeLink: { db: 'badge_link' },
	badgeDescription: { db: 'badge_description' },
	personId: { db: 'person' },
	tournId: { db: 'tourn' },
	circuitId: { db: 'circuit' },
	nsdaCourseId: { db: 'nsda_course' },
	createdAt: { db: 'created_at', toDb: () => undefined },
	updatedAt: { db: 'timestamp', toDb: () => undefined },
};

export const toDomain = dbRow => {
	if (!dbRow) return null;
	const quiz = genericToDomain(dbRow, FIELD_MAP);
	return quiz;
};
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};