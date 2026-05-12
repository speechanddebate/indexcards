import { toDomain as genericToDomain, toPersistence as genericToPersistence, toBool, fromBool } from './mapperUtils.js';
import { toDomain as schoolToDomain } from './schoolMapper.js';
import { toDomain as ballotToDomain } from './ballotMapper.js';
import { toDomain as categoryToDomain } from './categoryMapper.js';

//deprecated
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
	school: 'school',
	category: 'category',
	alt_category: 'alt_category',
	covers: 'covers',
	chapter_judge: 'chapter_judge',
	person: 'person',
	person_request: 'person_request',
	score: 'score',
	tmp: 'tmp',
	settings: 'judge_settings',
	updatedAt: { db: 'timestamp', toDb: () => undefined },
	createdAt: { db: 'created_at', toDb: () => undefined },
};

export const toDomain = dbRow => {
	if (!dbRow) return null;
	const judge = genericToDomain(dbRow, FIELD_MAP);
	if (dbRow.category_category) {
		judge.Category = categoryToDomain(dbRow.category_category);
	}
	if (dbRow.school_school) {
		judge.School = schoolToDomain(dbRow.school_school);
	}
	if (dbRow.ballots && Array.isArray(dbRow.ballots)) {
		judge.Ballots = dbRow.ballots.map(ballotToDomain);
	}
	return judge;
};
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};