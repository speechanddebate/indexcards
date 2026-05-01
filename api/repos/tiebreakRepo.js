import db from '../data/db.js';
import { protocolInclude } from './protocolRepo.js';

function buildTiebreakQuery(opts = {}){

	const query  = {
		where   : {},
		include : [],
	};

	if(opts.include?.Protocol) {
		query.include.push({
			...protocolInclude(opts.include.Protocol),
			as       : 'protocol_protocol',
			required : opts.include.Protocol.required ?? false,
		});
	}
	return query;
}

export const tiebreakInclude = (opts = {}) => {
	return {
		...buildTiebreakQuery(opts),
		model : db.tiebreak,
		as    : 'Tiebreaks',
	};
};

export const getTiebreak = async (id, opts = {}) => {
	if (!id) throw new Error('getTiebreak: id is required');
	const query = buildTiebreakQuery(opts);
	query.where.id = id;
	return await db.tiebreak.findOne(query);
};

async function getTiebreaks(scope = {}, opts = {}) {
	const query = buildTiebreakQuery(opts);
	if (scope?.protocolId) {
		query.where = { ...query.where, protocol: scope.protocolId };
	}
	return await db.tiebreak.findAll(query);
}

export default {
	getTiebreak,
	getTiebreaks,
};
