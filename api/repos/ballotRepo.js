import db from '../data/db.js';
import { judgeInclude } from './judgeRepo.js';
import { sectionInclude } from './sectionRepo.js';
import { scoreInclude } from './scoreRepo.js';
import { FIELD_MAP, toDomain, toPersistence } from './mappers/ballotMapper.js';
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
			required: false,
		});
	}
	if(opts.include?.section) {
		query.include.push({
			...sectionInclude(opts.include.section),
			as: 'panel_panel',
			required: false,
		});
	}
	if(opts.include?.scores){
		query.include.push({
			...scoreInclude(opts.include.scores),
			as: 'scores',
			required: false,
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

export async function getBallot(ballotId, opts = {}) {
	const dbRow = await db.ballot.findByPk(ballotId, {
		...buildBallotQuery(opts),
	});
	return toDomain(dbRow);
}

export async function getBallots(scope, opts = {}) {
	const query = buildBallotQuery(opts);
	if (scope?.sectionId) {
		query.where = { ...query.where, panel: scope.sectionId };
	}
	const dbRows = await db.ballot.findAll(query);
	return dbRows.map(toDomain);
}
export async function createBallot(data = {}){
	const dbRow = await db.ballot.create(toPersistence(data));
	return dbRow.id;
}

export default {
	getBallot,
	getBallots,
	createBallot,
};