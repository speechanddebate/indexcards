import { toDomain as genericToDomain, toPersistence as genericToPersistence } from './mapperUtils.js';
import { toDomain as mapEvent } from './eventMapper.js';

export const FIELD_MAP = {
	id: 'id',
	type: 'type',
	name: 'name',
	label: 'label',
	flighted: 'flighted',
	postPrimary: 'post_primary',
	postSecondary: 'post_secondary',
	postFeedback: 'post_feedback',
	published: 'published',
	eventId : 'event',

	event : {
		db       : 'event_event',
		toDomain : mapEvent,
		toDb     : () => undefined,
	},
};

export const toDomain = dbRow => genericToDomain(dbRow, FIELD_MAP);
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};