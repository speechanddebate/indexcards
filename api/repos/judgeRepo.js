import db from '../data/db.js';
import { schoolInclude } from './schoolRepo.js';
import { toDomain, toPersistence, FIELD_MAP } from './mappers/judgeMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { withSettingsInclude } from './utils/settings.js';

function buildJudgeQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};

	if (opts.include?.school) {
		query.include.push({
			...schoolInclude(opts.include.school),
			as: 'school_school',
			required: false,
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