import { toDomain as genericToDomain, toPersistence as genericToPersistence} from './mapperUtils.js';
import { toDomain as roundToDomain } from './roundMapper.js';

export const FIELD_MAP = {
	id: 'id',
	name: 'name',
	start: 'start',
	end: 'end',
	tournId: 'tourn',
	updatedAt: { db: 'timestamp', toDb: () => undefined },
	createdAt: { db: 'created_at', toDb: () => undefined },
};

export const toDomain = dbRow => {
	if(!dbRow) return null;
	const domain = genericToDomain(dbRow, FIELD_MAP);
	if(dbRow.rounds){
		domain.Rounds = dbRow.rounds.map(r => roundToDomain(r));
	}
	return domain;
};
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};