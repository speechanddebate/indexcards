import db from '../data/db.js';
import { judgeInclude } from './judgeRepo.js';
import { sectionInclude } from './sectionRepo.js';
import { scoreInclude } from './scoreRepo.js';
import { FIELD_MAP } from './mappers/ballotMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildBallotQuery(opts = {}){
	const query  = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields,FIELD_MAP),
		include: [],
	};
	if(opts.include?.judge) {
		query.include.push({
			...judgeInclude(opts.include.judge),
			as: 'judge_judge',
		});
	}
	if(opts.include?.section) {
		query.include.push({
			...sectionInclude(opts.include.section),
			as: 'panel_panel',
		});
	}
	if(opts.include?.scores){
		query.include.push({
			...scoreInclude(opts.include.scores),
			as: 'scores',
		});
	}
	return query;
}

export function ballotInclude(opts = {}){
	return {
		model: db.ballot,
		as: 'ballots',
		...buildBallotQuery(opts),
	};
}