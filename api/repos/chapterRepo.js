import db from '../data/db.js';
import { FIELD_MAP, toDomain, toPersistence } from './mappers/chapterMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { chapterJudgeInclude } from './chapterJudge.js';

function buildChapterQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};

	if (opts.include?.chapterJudges) {
		query.include.push({
			...chapterJudgeInclude(opts.include.chapterJudges),
			required: false,
		});
	}

	return query;
}

export function chapterInclude(opts = {}) {
	return {
		model: db.chapter,
		as: 'chapters',
		...buildChapterQuery(opts),
	};
}

async function getChapter(id, opts = {}) {
	if (!id) throw new Error('getChapter: id is required');
	const query = buildChapterQuery(opts);
	query.where.id = id;
	const dbRow = await db.chapter.findOne(query);
	return toDomain(dbRow);
}

async function createChapter(data) {
	const dbRow = await db.chapter.create(toPersistence(data));
	return dbRow.id;
}

export default {
	getChapter,
	createChapter,
};
