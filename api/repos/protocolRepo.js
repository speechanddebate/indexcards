import db from '../data/db.js';
import { tiebreakInclude } from './tiebreakRepo.js';
import { snakeToCamel } from '../helpers/text.js';

const buildProtocolQuery = (opts = {}) => {

	let limiter = '';
	const query = {
		where: {},
		include: [],
	};

	if(!opts?.noTiebreak) {
		query.include.push({
			...tiebreakInclude(opts?.include?.Tiebreak),
			as       : 'tiebreaks',
			required : false,
		});
	}

	return {query, limiter};
};

export const protocolInclude = (opts = {}) => {

	const {query} = buildProtocolQuery(opts);

	return {
		model : db.protocol,
		as    : 'Protocol',
		...query,
	};
};

/*
 * Special case of returning just one
*/

export const getProtocol = async (protocolId, opts = {}) => {
	const rsen = await getProtocols({ protocolId }, {...opts});
	if (rsen.length) return rsen[0];
	return;
};

/**
 * Fetches protocols from the database with optional filters and tiebreak
 * information.
 **/

export const getProtocols = async (scope = {}, opts = {}) => {

	let { limiter } = buildProtocolQuery(opts);
	let limiterFields = '';

	Object.keys(scope).forEach( (rawField) => {

		if (rawField === 'protocolId') {
			limiter += ' and protocol.id = :protocolId ';
			return;
		}

		if (rawField === 'roundId') {
			limiterFields = ', round';
			limiter += ' and protocol.id = round.protocol and round.id = :roundId ';
			return;
		}

		let field = rawField.replace('Id', '');
		if (scope.tiebreakId) limiter += ` and protocol.${field} = :${rawField}`;
	});

	const protocols = await db.sequelize.query(`
		select
			protocol.id, protocol.name, protocol.tourn
		from protocol ${limiterFields}
		where 1=1
			${limiter}
		limit 1
	`, {
		type: db.Sequelize.QueryTypes.SELECT,
		replacements: { ...scope},
	});

	if(!opts?.noTiebreaks) {

		const tbs = {};

		const tiebreaks = await db.sequelize.query(`
			select tb.*
			from tiebreak tb, protocol ${limiterFields}
			where 1=1
				and protocol.id = tb.protocol
				${limiter}
			order by protocol.id, tb.priority
		`, {
			type: db.Sequelize.QueryTypes.SELECT,
			replacements: { ...scope},
		});

		tiebreaks.forEach( (tb) => {

			['truncate_smallest', 'violation'].forEach( tag => {
				if (tb[tag]) tb[tag] = true;
				if (!tb[tag]) delete tb[tag];
			});

			['truncate',
				'count_round',
				'multiplier',
				'priority',
				'highlow_count',
				'highlow_threshold',
				'highlow_target',
				'child',
			].forEach( tag => {
				if (tb[tag]) {
					tb[tag] = parseInt(tb[tag]);
					if (tag !== snakeToCamel(tag)) {
						tb[snakeToCamel(tag)] = parseInt(tb[tag]);
						delete tb[tag];
					}
				} else {
					delete tb[tag];
				}
			});

			tb.name = snakeToCamel(tb.name);

			['result', 'chair', 'highlow'].forEach( tag => {
				if (!tb[tag])  delete tb[tag];
			});

			if (!tbs[tb.protocol]) tbs[tb.protocol] = [];
			tbs[tb.protocol].push(tb);
			delete tb.timestamp;
			delete tb.protocol;
		});

		protocols.forEach( (protocol) => {
			protocol.Tiebreaks = tbs[protocol.id];
		});
	}
	return protocols;
};

export default {
	getProtocol,
	getProtocols,
};