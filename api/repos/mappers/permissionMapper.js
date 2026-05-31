// repos/mappers/permissionMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence} from './mapperUtils.js';

export const FIELD_MAP = {
	id: { db: 'id' },
	tag: { db: 'tag' },
	person: { db: 'person' },
	tourn: { db: 'tourn' },
	region: { db: 'region' },
	district: { db: 'district' },
	chapter: { db: 'chapter' },
	circuit: { db: 'circuit' },
	category: { db: 'category' },
	event: { db: 'event' },
	created_by: { db: 'created_by' },
	details: { db: 'details' },
	updatedAt: { db: 'timestamp', toDb: () => undefined },
	createdAt: { db: 'created_at', toDb: () => undefined },
};

export const toDomain = dbRow => {
	if(!dbRow) return null;
	const domain = genericToDomain(dbRow, FIELD_MAP);
	return domain;
};
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};