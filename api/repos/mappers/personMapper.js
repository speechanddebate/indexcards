import { toDomain as genericToDomain, toPersistence as genericToPersistence } from './mapperUtils.js';

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
	no_email      : 'no_email',
	siteAdmin     : 'site_admin',
	accesses      : 'accesses',
	lastAccess    : 'last_access',
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