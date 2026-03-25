import { toDomain as genericToDomain} from './mapperUtils.js';
import * as personMapper from './personMapper.js';

export const FIELD_MAP = {
	id        : 'id',
	ip        : 'ip',
	defaults  : 'defaults',
	agent_data : 'agent_data',
	geo_ip     : 'geo_ip',
	person  : 'person',
	su      : 'su',
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

	return domain;
};

export default {
	toDomain,
	FIELD_MAP,
};
