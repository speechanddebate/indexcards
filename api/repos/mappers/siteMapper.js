// repos/mappers/schoolMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence, toBool, fromBool } from './mapperUtils.js';
import { toDomain as roomDomain } from './roomMapper.js';

export const FIELD_MAP = {
	id: 'id',
	name: 'name',
	online: { db: 'online', toDomain: fromBool, toDb: toBool },
	directions: 'directions',
	dropoff: 'dropoff',
	hostId: 'host',
	circuitId: 'circuit',
	updatedAt: { db: 'timestamp', toDb: () => undefined },
	createdAt: { db: 'created_at', toDb: () => undefined },
};

export const toDomain = dbRow => {
	const domain = genericToDomain(dbRow, FIELD_MAP);
	if(Array.isArray(dbRow?.rooms)) {
		domain.rooms = dbRow.rooms.map(room => roomDomain(room));
	}
	return domain;
};
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};