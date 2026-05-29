// repos/mappers/studentMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence, toBool, fromBool } from './mapperUtils.js';
import { toDomain as ballotToDomain } from './ballotMapper.js';
import { toDomain as studentToDomain } from './studentMapper.js';

export const FIELD_MAP = {
	id: 'id',
	first: 'first',
	middle: 'middle',
	last: 'last',
	phonetic: 'phonetic',
	grad_year: 'grad_year',
	novice: { db: 'novice', fromDb: toBool, toDb: fromBool },
	retired: { db: 'retired', fromDb: toBool, toDb: fromBool },
	gender: 'gender',
	email: 'email',
	nsda: 'nsda',
	chapter: 'chapter',
	person: 'person',
	person_request: 'person_request',
	createdAt: { db: 'created_at', toDb: () => undefined },
	updatedAt: { db: 'timestamp', toDb: () => undefined },
};

export const toDomain = dbRow => {
	if(!dbRow) return null;
	const domain = genericToDomain(dbRow, FIELD_MAP);
	if(dbRow.ballot_ballot) domain.ballot = ballotToDomain(dbRow.ballot_ballot);
	if(dbRow.student_student) domain.student = studentToDomain(dbRow.student_student);
	return domain;
};
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};