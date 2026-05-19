import { toDomain as genericToDomain, toBool, fromBool } from './mapperUtils.js';
import { toDomain as chapterJudgeToDomain } from './chapterJudgeMapper.js';
import { toDomain as judgeToDomain } from './judgeMapper.js';
import { toDomain as personQuizToDomain } from './personQuizMapper.js';

export const FIELD_MAP = {
	id            : 'id',
	email         : 'email',
	first     : 'first',
	middle    : 'middle',
	last      : 'last',
	state         : 'state',
	country       : 'country',
	tz            : 'tz',
	nsda          : 'nsda',
	phone         : 'phone',
	gender        : 'gender',
	pronoun       : 'pronoun',
	no_email       : {db: 'no_email', toDomain: toBool, toPersistence: fromBool },
	site_admin     : {db: 'site_admin', toDomain: toBool, toPersistence: fromBool },
	accesses      : 'accesses',
	last_access    : 'last_access',
	password      : 'password',
	pass_timestamp : 'pass_timestamp',
	settings: 'person_settings',
	updatedAt: { db: 'timestamp', toDb: () => undefined },
	createdAt: { db: 'created_at', toDb: () => undefined },
};

export const toDomain = dbRow => {
	if (!dbRow) return null;
	var person = genericToDomain(dbRow,FIELD_MAP);
	if (dbRow.chapter_judges && Array.isArray(dbRow.chapter_judges)) {
		person.ChapterJudges = dbRow.chapter_judges.map(chapterJudgeToDomain);
	}
	if (dbRow.person_judges && Array.isArray(dbRow.person_judges)) {
		person.Judges = dbRow.person_judges.map(judgeToDomain);
	} else if (person.judges && Array.isArray(dbRow.judges)) {
		person.Judges = dbRow.judges.map(judgeToDomain);
	}
	if (dbRow.person_quizzes && Array.isArray(dbRow.person_quizzes)) {
		person.PersonQuizzes = dbRow.person_quizzes.map(personQuizToDomain);
	}

	return person;
};

export default {
	toDomain,
	FIELD_MAP,
};