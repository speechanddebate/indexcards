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
	show_answers: { db: 'show_answers', toDomain: toBool, toDb: fromBool },
	admin_only: { db: 'admin_only', toDomain: toBool, toDb: fromBool },
	badge: 'badge',
	badge_link: { db: 'badge_link' },
	badge_description: { db: 'badge_description' },
	person: { db: 'person' },
	tourn: { db: 'tourn' },
	circuit: { db: 'circuit' },
	nsda_course: { db: 'nsda_course' },
	created_at: { db: 'created_at', toDb: () => undefined },
	updated_at: { db: 'timestamp', toDb: () => undefined },
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