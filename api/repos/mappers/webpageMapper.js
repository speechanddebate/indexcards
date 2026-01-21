// repos/mappers/schoolMapper.js
import { toDomain as genericToDomain, toPersistence as genericToPersistence } from './mapperUtils.js';

export const FIELD_MAP = {
	id: 'id',
	title: 'title',
	slug: 'slug',
	content: 'content',
	sidebar: 'sidebar',
	published: 'published',
	sitewide: 'sitewide',
	special: 'special',
	pageOrder: 'page_order',
	tournId: 'tourn',
	parentId: 'parent',
	lastEditorId: 'last_editor',
	lastModified: 'timestamp',
	createdAt: 'created_at',
};

export const toDomain = dbRow => genericToDomain(dbRow, FIELD_MAP);
export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};