import { toDomain as genericToDomain, toPersistence as genericToPersistence, toBool, fromBool } from './mapperUtils.js';

export const FIELD_MAP = {
	id            : 'id',
	email         : 'email',
	firstName     : 'first',
	middleName    : 'middle',
	lastName      : 'last',
	state         : 'state',
	country       : 'country',
	tz            : 'tz',
	nsda          : 'nsda',
	phone         : 'phone',
	gender        : 'gender',
	pronoun       : 'pronoun',
	noEmail       : {db: 'no_email', toDomain: toBool, toPersistence: fromBool },
	siteAdmin     : {db: 'site_admin', toDomain: toBool, toPersistence: fromBool },
	accesses      : 'accesses',
	lastAccess    : 'last_access',
	password      : 'password',
	passTimestamp : 'pass_timestamp',
	settings: 'person_settings',
	updatedAt: { db: 'timestamp', toDb: () => undefined },
	createdAt: { db: 'created_at', toDb: () => undefined },
};

export const toDomain = dbRow => genericToDomain(dbRow, FIELD_MAP);
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};