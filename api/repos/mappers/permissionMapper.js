// repos/mappers/permissionMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence} from './mapperUtils.js';

export const FIELD_MAP = {
	id: { db: 'id' },
	tag: { db: 'tag' },
	personId: { db: 'person' },
	tournId: { db: 'tourn' },
	regionId: { db: 'region' },
	districtId: { db: 'district' },
	chapterId: { db: 'chapter' },
	circuitId: { db: 'circuit' },
	categoryId: { db: 'category' },
	eventId: { db: 'event' },
	createdBy: { db: 'created_by' },
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