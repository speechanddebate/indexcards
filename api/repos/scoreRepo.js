import db from '../data/db.js';
import { FIELD_MAP, toDomain, toPersistence } from './mappers/scoreMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
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
			required: false,
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

async function getScore(id, opts = {}) {
	const score = await db.score.findByPk(id, {
		...buildScoreQuery(opts),
	});
	return toDomain(score);
}
async function getScores(scope, opts = {}) {
	const query = buildScoreQuery(opts);
	if (scope?.ballotId) {
		query.where = { ...query.where, ballot: scope.ballotId };
	}
	const scores = await db.score.findAll(query);
	return scores.map(toDomain);
}
async function createScore(data) {
	const score = await db.score.create(toPersistence(data));
	return score.id;
}

export default {
	getScore,
	getScores,
	createScore,
};