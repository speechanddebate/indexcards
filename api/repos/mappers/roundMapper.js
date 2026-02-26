import { toDomain as genericToDomain, toPersistence as genericToPersistence } from './mapperUtils.js';
import { toDomain as eventToDomain } from './eventMapper.js';
import { toDomain as sectionToDomain } from './sectionMapper.js';

export const FIELD_MAP = {
	id            : 'id',
	type          : 'type',
	name          : 'name',
	label         : 'label',
	flighted      : 'flighted',
	postPrimary   : 'post_primary',
	postSecondary : 'post_secondary',
	postFeedback  : 'post_feedback',
	published     : 'published',
	eventId       : 'event',
};

export const toDomain = dbRow => {
	if(!dbRow) return null;
	const domain = genericToDomain(dbRow, FIELD_MAP);
	if(dbRow.event_event){
		domain.Event = eventToDomain(dbRow.event_event);
	}
	if(dbRow.panels){
		domain.Sections = dbRow.panels.map(sectionToDomain);
	}
	return domain;
};
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};