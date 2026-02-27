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

async function createJudge(data){
	const judge = await db.judge.create(toPersistence(data));
	return judge.id;
}

export default {
	getJudge,
	createJudge,
};