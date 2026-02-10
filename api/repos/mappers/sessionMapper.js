import { toDomain as genericToDomain, toPersistence as genericToPersistence } from './mapperUtils.js';
import * as personMapper from './personMapper.js';

export const FIELD_MAP = {
	id        : 'id',
	ip        : 'ip',
	defaults  : 'defaults',
	agentData : 'agent_data',
	geoIP     : 'geo_ip',
	personId  : 'person',
	suId      : 'su',
};

export const toDomain = dbRow => {

	if(!dbRow) return null;

	const domain = genericToDomain(dbRow, FIELD_MAP);

	if (dbRow.su_person) {
		domain.Su = personMapper.toDomain(dbRow.su_person);
	}

	if (dbRow.person_person) {
		domain.Person = personMapper.toDomain(dbRow.person_person);
	}

	if (dbRow.Person) {
		domain.Person = personMapper.toDomain(dbRow.Person);
	}

	return domain;
};

export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};
