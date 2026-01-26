// repos/mappers/schoolMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence } from './mapperUtils.js';

export const FIELD_MAP = {
	id: 'id',
	name: 'name',
	online: 'online',
	directions: 'directions',
	dropoff: 'dropoff',
	host: 'host',
	circuit: 'circuit',
	lastModified: 'timestamp',

};

export const toDomain = dbRow => {
	const domain = genericToDomain(dbRow, FIELD_MAP);
	//set the tournId if available
	if (dbRow.tourn_sites?.length) {
		domain.tournId = dbRow.tourn_sites[0].tourn;
	}
	if(Array.isArray(dbRow.rooms)) {
		domain.rooms = dbRow.rooms.map(room => toDomain(room));
	}
	return domain;
};
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};