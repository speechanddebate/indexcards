import db from '../data/db.js';
import { schoolInclude } from './schoolRepo.js';
import { categoryInclude } from './categoryRepo.js';
import { ballotInclude } from './ballotRepo.js';
import { toDomain, toPersistence, FIELD_MAP } from './mappers/judgeMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { withSettingsInclude } from './utils/settings.js';

function buildJudgeQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};

	if (opts.where) {
		query.where = { ...query.where, ...opts.where };
	}

	if (opts.include?.Category) {
		query.include.push({
			...categoryInclude(opts.include.Category),
			as: 'category_category',
			required: opts.include.Category.required ?? false,
		});
	}
	if (opts.include?.School) {
		query.include.push({
			...schoolInclude(opts.include.School),
			as: 'school_school',
			required: false,
		});
	}
	if(opts.include?.Ballots) {
		query.include.push({
			...ballotInclude(opts.include.Ballots),
			as: 'ballots',
			required: opts.include.Ballots.required ?? false,
		});
	}

	// Judge settings (same pattern as category)
	query.include.push(
		...withSettingsInclude({
			model: db.judgeSetting,
			as: 'judge_settings',
			settings: opts.settings,
		})
	);

	return query;
}
export function judgeInclude(opts = {}) {
	return {
		model: db.judge,
		as: 'judges',
		...buildJudgeQuery(opts),
	};
}

async function getJudge(id,opts){
	const judge = await db.judge.findByPk(id, buildJudgeQuery(opts));
	return toDomain(judge);
}

async function getJudges(opts = {}) {
	const query = buildJudgeQuery(opts);
	const judges = await db.judge.findAll(query);
	return judges.map(toDomain);
}

async function createJudge(data){
	const judge = await db.judge.create(toPersistence(data));
	return judge.id;
}

async function updateJudge(id, data){
	await db.judge.update(toPersistence(data), { where: { id } });
	return getJudge(id);
}

async function unlinkedSearch({ first, last }, opts = {}) {
	if (!first || !last) {
		throw new Error('unlinkedSearch requires first and last parameters');
	}

	const sql = `
		SELECT 
			judge.id,
			judge.first,
			judge.middle,
			judge.last,
			tourn.name AS tourn_name,
			school.name AS school_name
		FROM judge
		LEFT JOIN category ON judge.category = category.id
		LEFT JOIN tourn ON category.tourn = tourn.id
		LEFT JOIN school ON judge.school = school.id
		WHERE judge.first LIKE :first
			AND judge.last LIKE :last
			AND (judge.person = 0 OR judge.person IS NULL)
			AND (tourn.end IS NULL OR tourn.end > NOW())
			AND (:notRequestedBy IS NULL OR judge.person_request IS NULL OR judge.person_request != :notRequestedBy)
		ORDER BY tourn.start, judge.last ASC, judge.first ASC
	`;

	return db.sequelize.query(sql, {
		replacements: {
			first: `${first}%`,
			last: `${last}%`,
			notRequestedBy: opts.notRequestedBy ?? null,
		},
		type: db.Sequelize.QueryTypes.SELECT,
	});
}

export default {
	getJudge,
	getJudges,
	createJudge,
	updateJudge,
	unlinkedSearch,
};