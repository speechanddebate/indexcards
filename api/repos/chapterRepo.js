import db from '../data/db.js';
import { FIELD_MAP, toDomain, toPersistence } from './mappers/chapterMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { chapterJudgeInclude } from './chapterJudgeRepo.js';

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

async function getAdmins(chapterId) {
	if (!chapterId) throw new Error('getChapterAdmins: chapterId is required');
	const dbRows = await db.person.findAll({
		include: [{
			model: db.permission,
			as: 'permissions',
			where: {
				chapter: chapterId,
				tag: 'chapter',
			},
			required: true,
		}],
	});
	return dbRows;
}

export default {
	getChapter,
	createChapter,
	getAdmins,
};
