// repos/mappers/schoolMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence } from './mapperUtils.js';

export const FIELD_MAP = {
	id: 'id',
	name: 'name',
	code: 'code',
	onsite: 'onsite',
	tourn: 'tourn',
	chapter: 'chapter',
	state: 'state',
	region: 'region',
	district: 'district',
	settings: 'school_settings',
	lastModified: { db: 'timestamp', toDb: () => undefined },
	createdAt: { db: 'created_at', toDb: () => undefined },
};

export const toDomain = dbRow => genericToDomain(dbRow, FIELD_MAP);
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};