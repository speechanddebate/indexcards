// repos/mappers/tournMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence, toBool, fromBool } from './mapperUtils.js';
import { toDomain as webpageToDomain } from './webpageMapper.js';
import { toDomain as fileToDomain } from './fileMapper.js';
export const FIELD_MAP = {
	id: {db: 'id', toDb: () => undefined },
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

export const toDomain = dbRow => {
	if(!dbRow) return null;
	const domain = genericToDomain(dbRow, FIELD_MAP);
	if(dbRow.webpages) {
		domain.webpages = dbRow.webpages.map(webpage => webpageToDomain(webpage));
	}
	if(dbRow.files) {
		domain.files = dbRow.files.map(file => fileToDomain(file));
	}
	return domain;
};
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};