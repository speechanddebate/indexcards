// repos/mappers/tournMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence } from './mapperUtils.js';

export const FIELD_MAP = {
	id: 'id',
	name: 'name',
	city: 'city',
	state: 'state',
	country: 'country',
	tz: 'tz',
	webname: 'webname',
	hidden: { db: 'hidden', toDomain: v => Boolean(v), toDb: v => (v ? 1 : 0) },
	start: 'start',
	end: 'end',
	regStart: 'reg_start',
	regEnd: 'reg_end',
	settings: 'tourn_settings',
	createdAt: 'timestamp',
};

export const toDomain = dbRow => genericToDomain(dbRow, FIELD_MAP);
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};