// repos/mappers/roomMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence } from './mapperUtils.js';

export const FIELD_MAP = {
	id: 'id',
	building: 'building',
	name: 'name',
	quality: 'quality',
	capacity: 'capacity',
	rowcount: 'rowcount',
	seats: 'seats',
	inactive: 'inactive',
	deleted: 'deleted',
	ada: 'ada',
	notes: 'notes',
	url: 'url',
	password: 'password',
	judgeUrl: 'judge_url',
	judgePassword: 'judge_password',
	api: 'api',
	site: 'site',
	circuit: 'circuit',
	online: 'online',
	directions: 'directions',
	dropoff: 'dropoff',
	host: 'host',
	lastModified: 'timestamp',
};

export const toDomain = dbRow => genericToDomain(dbRow, FIELD_MAP);
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};