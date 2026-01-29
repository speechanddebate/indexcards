// repos/mappers/tournMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence, toBool, fromBool } from './mapperUtils.js';

export const FIELD_MAP = {
	id: 'id',
	name: 'name',
	city: 'city',
	state: 'state',
	country: 'country',
	tz: 'tz',
	webname: 'webname',
	hidden: { db: 'hidden', toDomain: toBool, toDb: fromBool },
	start: 'start',
	end: 'end',
	regStart: 'reg_start',
	regEnd: 'reg_end',
	settings: 'tourn_settings',
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