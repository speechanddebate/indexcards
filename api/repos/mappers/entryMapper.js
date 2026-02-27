// repos/mappers/circuitMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence, toBool,fromBool } from './mapperUtils.js';

export const FIELD_MAP = {
	id: 'id',
	code: 'code',
	name: 'name',
	ada: { db: 'ada', toDomain: toBool, toDb: fromBool },
	active: { db: 'active', toDomain: toBool, toDb: fromBool },
	dropped: { db: 'dropped', toDomain: toBool, toDb: fromBool },
	waitlist: { db: 'waitlist', toDomain: toBool, toDb: fromBool },
	unconfirmed: { db: 'unconfirmed', toDomain: toBool, toDb: fromBool },
	tournId: 'tourn',
	schoolId: 'school',
	eventId: 'event',
	registeredBy: { db: 'registered_by' },
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