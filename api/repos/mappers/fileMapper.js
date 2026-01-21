// repos/mappers/schoolMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence } from './mapperUtils.js';

export const FIELD_MAP = {
	id: 'id',
	tag: 'tag',
	type: 'type',
	label: 'label',
	filename: 'filename',
	published: 'published',
	coachId: 'coach',
	pageOrder: 'page_order',
	uploaded: 'uploaded',
	billCategory: 'bill_category',
	tournId: 'tourn',
	schoolId: 'school',
	entryId: 'entry',
	eventId: 'event',
	districtId: 'district',
	circuitId: 'circuit',
	parentId: 'parent',
	personId: 'person',
	lastModified: 'timestamp',
};

export const toDomain = dbRow => genericToDomain(dbRow, FIELD_MAP);
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};