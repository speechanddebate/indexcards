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
	if (opts.limit) query.limit = opts.limit;
	if (opts.offset) query.offset = opts.offset;

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

	let sql = `
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
	if(opts.limit && opts.offset !== undefined) {
		sql += ' LIMIT :limit OFFSET :offset';
	}
	return db.sequelize.query(sql, {
		replacements: {
			first: `${first}%`,
			last: `${last}%`,
			limit: opts.limit,
			offset: opts.offset,
			notRequestedBy: opts.notRequestedBy ?? null,
		},
		type: db.Sequelize.QueryTypes.SELECT,
	});
}

async function getJudgeHistory(personId, limit, offset) {
	let sql = `
	select
	judge.id AS judge_id, judge.first, judge.last, judge.code,
	judge.obligation, judge.hired,
	category.id AS category_id, category.name as category_name, category.abbr,
	tourn.id AS tourn_id, tourn.name, tourn.city, tourn.state,
	CONVERT_TZ(tourn.start, '+00:00', tourn.tz),
	CONVERT_TZ(tourn.end, '+00:00', tourn.tz),
	CONVERT_TZ(weekend.start, '+00:00', tourn.tz),
	CONVERT_TZ(weekend.end, '+00:00', tourn.tz),
	COUNT(distinct round.id) AS round_count

	from (judge, category, tourn)

		left join event on event.category = category.id

		left join event_setting es
			on es.event = event.id
			and es.tag = 'weekend'

		left join weekend on weekend.id = es.value

		left join ballot on ballot.judge = judge.id

		left join panel on ballot.panel = panel.id

		left join round on round.id = panel.round
			and round.published = 1

	where judge.person = :personId
		and judge.category = category.id
		and category.tourn = tourn.id
		and tourn.start < NOW()
		and tourn.hidden != 1
	group by judge.id
	order by tourn.start DESC
	`;
	if(limit && offset !== undefined) {
		sql += ' LIMIT :limit OFFSET :offset';
	}

	const result = await db.sequelize.query(sql, {
		replacements: {
			personId,
			limit,
			offset,
		},
		type: db.Sequelize.QueryTypes.SELECT,
	});
	return result.map(row => ({
		id: row.judge_id,
		first: row.first,
		last: row.last,
		code: row.code,
		obligation: row.obligation,
		hired: row.hired,
		Category: {
			id: row.category_id,
			name: row.category_name,
			abbr: row.abbr,
		},
		Tourn: {
			id: row.tourn_id,
			name: row.name,
			city: row.city,
			state: row.state,
			start: row['CONVERT_TZ(tourn.start, \'+00:00\', tourn.tz)'],
			end: row['CONVERT_TZ(tourn.end, \'+00:00\', tourn.tz)'],
		},
		Weekend: {
			start: row['CONVERT_TZ(weekend.start, \'+00:00\', tourn.tz)'],
			end: row['CONVERT_TZ(weekend.end, \'+00:00\', tourn.tz)'],
		},
		roundCount: row.round_count,
	}));
}

async function getLiveDocs(personId){
	const res = await db.sequelize.query(`
		select judge.id,
			category.abbr,
			tourn.name tourn_name,
			tourn.end tourn_end, tourn.tz tourn_tz,
			livedoc_url.value_text url,
			livedoc_caption.value caption

		from (judge, category, tourn, category_setting livedoc_url)

			left join category_setting livedoc_caption
				on livedoc_caption.category = category.id
				and livedoc_caption.tag = 'livedoc_caption'

		where judge.person = :personId
			and judge.category = category.id
			and category.tourn = tourn.id
			and tourn.end > NOW()
			and tourn.start > DATE_SUB(NOW(), INTERVAL 7 DAY)
			and tourn.hidden != 1
			and category.id = livedoc_url.category
		and livedoc_url.tag = 'livedoc_url'
		`, {
		replacements: {
			personId,
		},
		type: db.Sequelize.QueryTypes.SELECT,
	});
	return res.map(row => ({
		judgeId: row.id,
		categoryAbbr: row.abbr,
		tournName: row.tourn_name,
		tournEnd: row.tourn_end,
		tournTz: row.tourn_tz,
		url: row.url,
		caption: row.caption,
	}));
}
export default {
	getJudge,
	getJudges,
	createJudge,
	updateJudge,
	unlinkedSearch,
	getJudgeHistory,
	getLiveDocs,
};
