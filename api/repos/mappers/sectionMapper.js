import { toDomain as genericToDomain, toPersistence as genericToPersistence, toBool, fromBool } from './mapperUtils.js';
import { toDomain as ballotToDomain } from './ballotMapper.js';

export const FIELD_MAP = {
	id: 'id',
	letter: 'letter',
	flight: 'flight',
	bye: { db: 'bye', fromDb: toBool, toDb: fromBool },
	started: 'started',
	bracket: 'bracket',
	published: { db: 'publish', fromDb: toBool, toDb: fromBool },
	roomId: 'room',
	roundId: 'round',
	updatedAt: { db: 'timestamp', toDb: () => undefined },
	createdAt: { db: 'created_at', toDb: () => undefined },
};

export const toDomain = dbRow => {
	if(!dbRow) return null;
	const domain = genericToDomain(dbRow, FIELD_MAP);
	if(dbRow.ballots){
		domain.ballots = dbRow.ballots.map(ballotToDomain);
	};
	return domain;
};
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};