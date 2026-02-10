// repos/mappers/schoolMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence } from './mapperUtils.js';
import {toDomain as roundToDomain} from './roundMapper.js';

export const FIELD_MAP = {
	id: 'id',
	name: 'name',
	abbr: 'abbr',
	type: 'type',
	level: 'level',
	categoryId: 'category',
	tournId: 'tourn',
	settings: 'event_settings',
};

export const toDomain = dbRow => {
	if(!dbRow) return null;
	const domain = genericToDomain(dbRow, FIELD_MAP);
	if(dbRow.rounds){
		domain.rounds = dbRow.rounds.map(roundToDomain);
	}
	return domain;
};
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};