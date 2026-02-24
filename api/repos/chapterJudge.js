import db from '../data/db.js';
import { chapterInclude } from './chapterRepo.js';
import { FIELD_MAP, toDomain, toPersistence } from './mappers/chapterJudgeMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildChapterJudgeQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};

	if (opts.include?.chapter) {
		query.include.push({
			...chapterInclude(opts.include.chapter),
			as: 'chapter_chapter',
			required: false,
		});
	}

	return query;
}

export function chapterJudgeInclude(opts = {}) {
	return {
		model: db.chapterJudge,
		as: 'chapter_judges',
		...buildChapterJudgeQuery(opts),
	};
}

async function getChapterJudge(id, opts = {}) {
	if (!id) throw new Error('getChapterJudge: id is required');
	const query = buildChapterJudgeQuery(opts);
	query.where.id = id;
	const dbRow = await db.chapterJudge.findOne(query);
	return toDomain(dbRow);
}

async function createChapterJudge(data) {
	const dbRow = await db.chapterJudge.create(toPersistence(data));
	return dbRow.id;
}

export default {
	getChapterJudge,
	createChapterJudge,
};
