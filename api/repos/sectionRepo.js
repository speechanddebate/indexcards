import db from '../data/db.js';
import { FIELD_MAP } from './mappers/sectionMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { ballotInclude } from './ballotRepo.js';

function buildSectionQuery(opts = {}){
	const query  = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields,FIELD_MAP),
		include: [],
	};

	if(opts.include?.ballots){
		query.include.push({
			...ballotInclude(opts.include.ballots),
			as: 'ballots',
		});
	}

	return query;
}

export function sectionInclude(opts = {}){
	return {
		model: db.panel,
		as: 'panels',
		...buildSectionQuery(opts),
	};
}