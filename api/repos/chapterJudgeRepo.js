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

	if (opts.where) {
		query.where = { ...query.where, ...opts.where };
	}
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
async function getChapterJudges(opts = {}) {
	const query = buildChapterJudgeQuery(opts);
	const dbRows = await db.chapterJudge.findAll(query);
	return dbRows.map(toDomain);
}

async function createChapterJudge(data) {
	const dbRow = await db.chapterJudge.create(toPersistence(data));
	return dbRow.id;
}
async function updateChapterJudge(id, data) {
	if (!id) throw new Error('updateChapterJudge: id is required');
	await db.chapterJudge.update(toPersistence(data), { where: { id } });
}
async function unlinkedSearch({ first, last }, opts = {}) {
	if (!first || !last) {
		throw new Error('unlinkedSearch requires first and last parameters');
	}

	const sql = `
		SELECT
			cj.id,
			cj.first,
			cj.middle,
			cj.last,
			chapter.name AS chapter_name,
			COUNT(DISTINCT category.tourn) AS tourn_count
		FROM chapter_judge cj
		LEFT JOIN chapter ON cj.chapter = chapter.id
		LEFT JOIN judge ON judge.chapter_judge = cj.id
		LEFT JOIN category ON judge.category = category.id
		WHERE cj.first LIKE :first
			AND cj.last LIKE :last
			AND (cj.person = 0 OR cj.person IS NULL)
			AND (:notRequestedBy IS NULL OR cj.person_request IS NULL OR cj.person_request != :notRequestedBy)
		GROUP BY cj.id, cj.first, cj.middle, cj.last, chapter.name
		ORDER BY cj.last ASC, cj.first ASC
	`;

	return db.sequelize.query(sql, {
		replacements: {
			first: `${first}%`,
			last:  `${last}%`,
			notRequestedBy: opts.notRequestedBy ?? null,
		},
		type: db.Sequelize.QueryTypes.SELECT,
	});
};

export default {
	getChapterJudge,
	getChapterJudges,
	createChapterJudge,
	updateChapterJudge,
	unlinkedSearch,
};
