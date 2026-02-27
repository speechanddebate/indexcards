// repos/mappers/categoryMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence } from './mapperUtils.js';
import { toDomain as judgeDomain } from './judgeMapper.js';
import { toDomain as jPoolDomain } from './jPoolMapper.js';
import { toDomain as tournDomain } from './tournMapper.js';

export const FIELD_MAP = {
	id: 'id',
	name: 'name',
	abbr: 'abbr',
	tournId: 'tourn',
	patternId: 'pattern',
	settings: 'category_settings',
	createdAt: { db: 'created_at', toDb: () => undefined },
	updatedAt: { db: 'timestamp', toDb: () => undefined },
};

export const toDomain = dbRow => {
	if(!dbRow) return null;
	const domain = genericToDomain(dbRow, FIELD_MAP);
	if(dbRow.tourn_tourn) {
		domain.Tourn = tournDomain(dbRow.tourn_tourn);
	}
	if(Array.isArray(dbRow.judges)) {
		domain.judges = dbRow.judges.map(judge => judgeDomain(judge));
	}
	if(Array.isArray(dbRow.jpools)) {
		domain.jpools = dbRow.jpools.map(jpool => jPoolDomain(jpool));
	}
	return domain;
};
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};