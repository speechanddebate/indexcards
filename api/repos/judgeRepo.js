import db from '../data/db.js';
import { withSettingsInclude } from './utils/settings.js';

function buildJudgeQuery(opts = {}) {
	const query = {
		include: [],
	};

	// Default: all fields
	if (Array.isArray(opts.fields) && opts.fields.length > 0) {
		query.attributes = opts.fields;
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