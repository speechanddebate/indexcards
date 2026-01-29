// repos/mappers/schoolMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence } from './mapperUtils.js';
import { toDomain as roomDomain } from './roomMapper.js';

export const FIELD_MAP = {
	id: 'id',
	name: 'name',
	online: 'online',
	directions: 'directions',
	dropoff: 'dropoff',
	host: 'host',
	circuit: 'circuit',
	updatedAt: 'timestamp',

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