// repos/mappers/scoreMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence } from './mapperUtils.js';
import { toDomain as ballotToDomain } from './ballotMapper.js';

export const FIELD_MAP = {
	id: 'id',
	tag: 'tag',
	value: 'value',
	content: 'onsite',
	topic: 'topic',
	speech: 'speech',
	position: 'position',
	ballot: 'ballot',
	student: 'student',
	category: 'cat_id',
	tiebreak: 'tiebreak',
	settings: 'score_settings',
	updatedAt: { db: 'timestamp', toDb: () => undefined },
	createdAt: { db: 'created_at', toDb: () => undefined },
};

export const toDomain = dbRow => {
	if(!dbRow) return null;
	const domain = genericToDomain(dbRow, FIELD_MAP);
	if(dbRow.ballot_ballot) domain.Ballot = ballotToDomain(dbRow.ballot_ballot);
	return domain;
};
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};