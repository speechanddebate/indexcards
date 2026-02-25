import { toDomain as genericToDomain, toPersistence as genericToPersistence, toBool, fromBool } from './mapperUtils.js';
import { toDomain as chapterJudgeToDomain } from './chapterJudgeMapper.js';
import { toDomain as judgeToDomain } from './judgeMapper.js';

export const FIELD_MAP = {
	id            : 'id',
	email         : 'email',
	firstName     : 'first',
	middleName    : 'middle',
	lastName      : 'last',
	state         : 'state',
	country       : 'country',
	tz            : 'tz',
	nsda          : 'nsda',
	phone         : 'phone',
	gender        : 'gender',
	pronoun       : 'pronoun',
	noEmail       : {db: 'no_email', toDomain: toBool, toPersistence: fromBool },
	siteAdmin     : {db: 'site_admin', toDomain: toBool, toPersistence: fromBool },
	accesses      : 'accesses',
	lastAccess    : 'last_access',
	password      : 'password',
	passTimestamp : 'pass_timestamp',
	settings: 'person_settings',
	updatedAt: { db: 'timestamp', toDb: () => undefined },
	createdAt: { db: 'created_at', toDb: () => undefined },
};

export const toDomain = dbRow => {
	if (!dbRow) return null;
	var person = genericToDomain(dbRow, FIELD_MAP);
	if (dbRow.chapter_judges && Array.isArray(dbRow.chapter_judges)) {
		person.ChapterJudges = dbRow.chapter_judges.map(chapterJudgeToDomain);
	}
	if (dbRow.judges && Array.isArray(dbRow.judges)) {
		person.Judges = dbRow.judges.map(judgeToDomain);
	}

	return person;
};
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};