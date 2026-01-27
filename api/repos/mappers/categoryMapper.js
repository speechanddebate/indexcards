// repos/mappers/categoryMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence } from './mapperUtils.js';

export const FIELD_MAP = {
	id: 'id',
	name: 'name',
	abbr: 'abbr',
	tournId: 'tourn',
	patternId: 'pattern',
	settings: 'category_settings',
	createdAt: { db: 'created_at', toDb: () => undefined },
	lastModified: { db: 'timestamp', toDb: () => undefined },
};

export const toDomain = dbRow => genericToDomain(dbRow, FIELD_MAP);
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};