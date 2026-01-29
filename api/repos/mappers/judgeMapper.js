import { toDomain as genericToDomain, toPersistence as genericToPersistence, toBool, fromBool } from './mapperUtils.js';

export const FIELD_MAP = {
	id: 'id',
	code: 'code',
	first: 'first',
	middle: 'middle',
	last: 'last',
	active: { db: 'active', toDomain: toBool, toDb: fromBool },
	ada: { db: 'ada', toDomain: toBool, toDb: fromBool },
	obligation: 'obligation',
	hired: 'hired',
	schoolId: 'school',
	categoryId: 'category',
	altCategoryId: 'alt_category',
	coversId: 'covers',
	chapterJudgeId: 'chapter_judge',
	personId: 'person',
	personRequestId: 'person_request',
	scoreId: 'score',
	tmp: 'tmp',
	settings: 'judge_settings',
	lastModified: { db: 'timestamp', toDb: () => undefined },
	createdAt: { db: 'created_at', toDb: () => undefined },
};

export const toDomain = dbRow => genericToDomain(dbRow, FIELD_MAP);
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};