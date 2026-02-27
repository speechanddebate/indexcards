import db from '../data/db.js';
import { judgeInclude } from './judgeRepo.js';
import { sectionInclude } from './sectionRepo.js';
import { scoreInclude } from './scoreRepo.js';
import { entryInclude } from './entryRepo.js';
import { FIELD_MAP, toDomain, toPersistence } from './mappers/ballotMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildBallotQuery(opts = {}){
	const query  = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields,FIELD_MAP),
		include: [],
	};
	if(opts.winnerBallot){

		//only ballots with a score.tag = 'winloss' and score.value = ballot.side should be included
	}
	if(opts.include?.judge) {
		query.include.push({
			...judgeInclude(opts.include.judge),
			as: 'judge_judge',
			required: false,
		});
	}
	if(opts.include?.Entry) {
		query.include.push({
			...entryInclude(opts.include.Entry),
			as: 'entry_entry',
			required: opts.include.Entry.required ?? false,
		});
	}
	if(opts.include?.Section) {
		query.include.push({
			...sectionInclude(opts.include.Section),
			as: 'panel_panel',
			required: false,
		});
	}
	if(opts.include?.Scores){
		query.include.push({
			...scoreInclude(opts.include.Scores),
			as: 'ballot_scores',
			required: opts.include.Scores.required ?? false,
		});
	}
	if (opts.winnerBallot) {

		const existing = query.include.find(i => i.as === 'ballot_scores');

		if (existing) {
			existing.required = true;
			existing.where = {
				...(existing.where || {}),
				tag: 'winloss',
				value: 1,
			};
		} else {
			query.include.push({
				model: db.score,
				as: 'ballot_scores',
				attributes: [],
				required: true,
				where: {
					tag: 'winloss',
					value: 1,
				},
			});
		}
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