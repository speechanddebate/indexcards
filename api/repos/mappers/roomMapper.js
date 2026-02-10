// repos/mappers/roomMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence, toBool, fromBool } from './mapperUtils.js';
import { toDomain as siteToDomain } from './siteMapper.js';
export const FIELD_MAP = {
	id: 'id',
	building: 'building',
	name: 'name',
	quality: 'quality',
	capacity: 'capacity',
	rowcount: 'rowcount',
	seats: 'seats',
	inactive: { db: 'inactive', fromDb: toBool, toDb: fromBool },
	deleted: { db: 'deleted', fromDb: toBool, toDb: fromBool },
	ada: { db: 'ada', fromDb: toBool, toDb: fromBool },
	notes: 'notes',
	url: 'url',
	password: 'password',
	judgeUrl: 'judge_url',
	judgePassword: 'judge_password',
	api: 'api',
	siteId: 'site',
	circuitId: 'circuit',
	online: 'online',
	directions: 'directions',
	dropoff: 'dropoff',
	host: 'host',
	updatedAt: {db: 'timestamp', toDb: () => undefined },
	createdAt: {db: 'created_at', toDb: () => undefined },
};

export const toDomain = dbRow => {
	if(!dbRow) return null;
	const domain = genericToDomain(dbRow, FIELD_MAP);
	if(dbRow.site_site){
		domain.site = siteToDomain(dbRow.site_site);
	}
	return domain;
};

export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};