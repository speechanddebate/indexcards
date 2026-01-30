import db from '../data/db.js';
import { FIELD_MAP } from './mappers/schoolMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { studentInclude } from './studentRepo.js';
import { ballotInclude } from './ballotRepo.js';

function buildScoreQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};
	if(opts?.include?.ballot){
		query.include.push({
			...ballotInclude(opts?.include?.ballot),
			as: 'ballot_ballot',
		});
	}
	if(opts?.include?.student){
		query.include.push({
			...studentInclude(opts?.include?.student),
			as: 'student_student',
		});
	}
	return query;
}

export function scoreInclude(opts = {}) {
	return {
		model: db.score,
		as: 'scores',
		...buildScoreQuery(opts),
	};
}