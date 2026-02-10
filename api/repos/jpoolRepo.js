import db from '../data/db.js';
import { FIELD_MAP } from './mappers/jPoolMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildJPoolQuery(opts = {}){
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};
	return query;
}

export function jPoolInclude(opts = {}) {
	return {
		model: db.jpool,
		...buildJPoolQuery(opts),
	};
}