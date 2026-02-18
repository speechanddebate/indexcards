// repos/mappers/circuitMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence, toBool,fromBool } from './mapperUtils.js';
import {toDomain as tournToDomain} from './tournMapper.js';

export const FIELD_MAP = {
	id: 'id',
	name: 'name',
	abbr: 'abbr',
	tz: 'tz',
	active: { db: 'active', toDomain: fromBool, toPersistence: toBool },
	state: 'state',
	country: 'country',
	webname: 'webname',
	settings: 'circuit_settings',
	updatedAt: { db: 'timestamp' , toPersistence: undefined},
	createdAt: { db: 'created_at', toPersistence: undefined },
};

export const toDomain = dbRow => {
	if(!dbRow) return null;
	const domain = genericToDomain(dbRow, FIELD_MAP);
	if(dbRow.tourn_circuits){
		domain.tourns = dbRow.tourn_circuits.map(tc => tournToDomain(tc.tourn_tourn));
	}
	return domain;
};
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};