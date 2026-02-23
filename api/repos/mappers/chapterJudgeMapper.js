import { toDomain as genericToDomain, toPersistence as genericToPersistence, toBool, fromBool } from './mapperUtils.js';
import { toDomain as chapterToDomain } from './chapterMapper.js';

export const FIELD_MAP = {
	id: 'id',
	first: 'first',
	middle: 'middle',
	last: 'last',
	ada: { db: 'ada', toDomain: toBool, toDb: fromBool },
	retired: { db: 'retired', toDomain: toBool, toDb: fromBool },
	phone: 'phone',
	email: 'email',
	diet: 'diet',
	notes: 'notes',
	notesTimestamp: 'notes_timestamp',
	gender: 'gender',
	nsda: 'nsda',
	chapterId: 'chapter',
	personId: 'person',
	personRequestId: 'person_request',
	updatedAt: { db: 'timestamp', toDb: () => undefined },
	createdAt: { db: 'created_at', toDb: () => undefined },
};

export const toDomain = dbRow => {
	if (!dbRow) return null;
	const domain = genericToDomain(dbRow, FIELD_MAP);

	if (dbRow.chapter_chapter) {
		domain.Chapter = chapterToDomain(dbRow.chapter_chapter);
	}

	return domain;
};

export const toPersistence = domainObj => genericToPersistence(domainObj, FIELD_MAP);

export default {
	toDomain,
	toPersistence,
	FIELD_MAP,
};
