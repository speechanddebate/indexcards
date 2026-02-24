import { toDomain as genericToDomain, toPersistence as genericToPersistence, toBool, fromBool } from './mapperUtils.js';

export const FIELD_MAP = {
	id: 'id',
	name: 'name',
	formal: 'formal',
	street: 'street',
	city: 'city',
	state: 'state',
	zip: 'zip',
	postal: 'postal',
	country: 'country',
	coaches: 'coaches',
	selfPrefs: { db: 'self_prefs', toDomain: toBool, toDb: fromBool },
	level: 'level',
	nsda: 'nsda',
	district: 'district',
	naudl: { db: 'naudl', toDomain: toBool, toDb: fromBool },
	ipeds: 'ipeds',
	nces: 'nces',
	ceeb: 'ceeb',
	updatedAt: { db: 'timestamp', toDb: () => undefined },
	createdAt: { db: 'created_at', toDb: () => undefined },
};

export const toDomain = dbRow => genericToDomain(dbRow, FIELD_MAP);
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};
