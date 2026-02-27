import db from '../data/db.js';
import { FIELD_MAP } from './mappers/entryMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildEntryQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};
	if(opts.limit){
		query.limit = opts.limit;
	}
	if(opts.offset){
		query.offset = opts.offset;
	}
	return query;
}

export function entryInclude(opts = {}) {
	return {
		model: db.entry,
		as: 'entries',
		...buildEntryQuery(opts),
	};
}
