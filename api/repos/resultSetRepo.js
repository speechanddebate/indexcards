import db from '../data/db.js';
import { eventInclude, getEvent } from './eventRepo.js';

const buildResultSetQuery = (opts = {}) => {

	let limiter = '';
	const query = {
		where: {},
		include: [],
	};

	if(opts?.include?.Event){
		query.include.push({
			...eventInclude(opts?.include?.Event),
			as       : 'event_event',
			required : false,
		});
	}

	if(opts.coach) {
		query.where.coach = 1;
		limiter = 'and rs.coach = 1';
	} else if(!opts.unpublished){
		query.where.published = 1;
		limiter = ' and rs.published = 1';
	}

	return {query, limiter};
};

/*
 * Special case of returning just one
*/

export const getResultSet = async (resultSetId, opts = {}) => {
	const rsen = await getResultSets({ resultSetId }, {...opts});
	if (rsen.length) return rsen[0];
	return;
};

/**
 * Fetches resultSets from the database with optional filters and event
 * information.
 **/

export const getResultSets = async (scope = {}, opts = {}) => {

	let { limiter } = buildResultSetQuery(opts);
	let limiterFields = '';

	Object.keys(scope).forEach( (rawField) => {

		if (rawField === 'resultSetId') {
			limiter += ' and rs.id = :resultSetId ';
			return;
		}

		if (rawField === 'tournId' && !scope.eventId) {
			limiterFields = ', event';
			limiter += ' and rs.event = event.id and event.tourn = :tournId ';
			return;
		}

		let field = rawField.replace('Id', '');
		if (scope.eventId) limiter += ` and rs.${field} = :${rawField}`;
	});

	const rsen = await db.sequelize.query(`
		select
			rs.id, rs.tag, rs.label, rs.published, rs.coach,
			rs.tourn, rs.event, rs.circuit, rs.code, rs.cache,
			rs.nsda_category nsdaCategory,
			rs.sweep_set sweepSet,
			rs.sweep_award sweepAward,
			rs.generated createdAt
		from result_set rs ${limiterFields}
		where 1=1
			${limiter}
	`, {
		type: db.Sequelize.QueryTypes.SELECT,
		replacements: { ...scope},
	});

	const promises = [];
	const processed = [];

	for (const rs of rsen) {

		rs.Event = undefined;

		if(opts?.include?.Event) {
			rs.Event = await getEvent(rs.event, {...opts?.include?.Event} );
		}

		if (!opts.noResults) {

			const rawResults = await db.sequelize.query(`
				select result.id,
					result.rank, result.place, result.percentile,
					result.result_set resultSet,
					result.entry, result.student, result.school,
					result.round, result.panel section,
					result.cache,
					result.created_at createdAt
				from result
					where 1=1
					and result.result_set = :resultSetId
			`, {
				type: db.Sequelize.QueryTypes.SELECT,
				replacements : { resultSetId: rs.id },
			});

			rs.Results = {};

			for (const result of rawResults) {
				if (result.entry) {
					rs.type = 'entry';
					delete result.student;
					delete result.school;
					rs.Results[result.entry] = result;
				} else if (result.student) {
					rs.type = 'student';
					delete result.entry;
					delete result.school;
					rs.Results[result.student] = result;
				} else if (result.school) {
					rs.type = 'school';
					delete result.student;
					delete result.entry;
					rs.Results[result.school] = result;
				}
			};
		}

		if (rs.cache) {
			rs.cache = JSON.parse(rs.cache);
		} else {

			const { headers, results } = await createResultCache( rs.id );
			rs.cache = headers;

			const update = db.sequelize.query(`
				update result_set
				set cache = :headers
				where 1=1
				and result_set.id = :resultSetId
			`, {
				type: db.Sequelize.QueryTypes.UPDATE,
				replacements : {
					headers     : JSON.stringify(headers),
					resultSetId : rs.id,
				},
			});

			promises.push(update);

			if (!opts.noResults) {
				for (const tagId in Object.keys(results)) {

					rs.Results[tagId].cache = results[tagId];
					const resUpdate = db.sequelize.query(`
						update result
						set cache = :result
						where result.id = :resultId
					`, {
						type: db.Sequelize.QueryTypes.UPDATE,
						replacements : {
							result: JSON.stringify(results[tagId]),
							resultId: results[tagId].result,
						},
					});

					promises.push(resUpdate);
				};
			};
		}
		processed.push(rs);
	};

	return processed;
};

export default {
	getResultSet,
	getResultSets,
};

// This function takes the not-great syntax I had for the results sets up to
// this point and converts to the faster access JSON blob.

export const createResultCache = async (resultSetId) => {

	const resultValues = await db.sequelize.query(`
		select
			rv.*,
			rk.tag keyTag, rk.description keyLabel, rk.no_sort noSort, rk.sort_desc sortDesc,
			protocol.name protocolName,
			result.id resultId, result.entry
		from (result, result_value rv)
			left join result_key rk on rk.id = rv.result_key
			left join protocol on protocol.id = rv.protocol
		where 1=1
			and result.result_set = :resultSetId
			and result.id = rv.result
		order by result.entry, result.school, result.student, rv.priority
	`, {
		type: db.Sequelize.QueryTypes.SELECT,
		replacements : { resultSetId },
	});

	const headers = {};
	const results = {};
	const protocols = {};

	resultValues.forEach( (rv) => {

		rv.type = '';

		if (rv.entry) {
			rv.type = 'entry';
			delete rv.school;
			delete rv.student;
		} else if (rv.school) {
			rv.type = 'school';
			delete rv.student;
			delete rv.entry;
		} else if (rv.student) {
			rv.type = 'student';
			delete rv.school;
			delete rv.entry;
		}

		if (!headers[rv.protocol]) headers[rv.protocol] = { };

		if (!headers[rv.protocol][rv.keyTag]) {
			headers[rv.protocol][rv.keyTag] = {
				label    : rv.keyLabel,
				priority : parseInt(rv.priority) || 9999,
			};
			if (!rv.noSort) headers[rv.protocol][rv.keyTag].noSort = true;
			if (rv.sortDesc) headers[rv.protocol][rv.keyTag].desc = true;
		}

		if (!results[rv[rv.type]])   				results[rv[rv.type]] = {};
		if (!results[rv[rv.type]][rv.protocol]) 	results[rv[rv.type]][rv.protocol] = {};
		results[rv[rv.type]][rv.protocol][rv.keyTag] = rv.value;

		if (!protocols[rv.protocol]) protocols[rv.protocol] = true;
	});

	const resultScores = await db.sequelize.query(`
		select
			result.entry,
			round.id, round.name, round.protocol,
			panel.bye sectionBye,
			ballot.bye, ballot.forfeit,
			score.tag, score.value
		from (result, ballot, panel, round)
			left join score on score.ballot = ballot.id
				and score.tag IN ('winloss', 'point', 'rank', 'refute')
		where 1=1
			and result.result_set = :resultSetId
			and result.entry = ballot.entry
			and ballot.panel = panel.id
			and panel.round = round.id
		order by result.entry, round.name
	`, {
		type         : db.Sequelize.QueryTypes.SELECT,
		replacements : { resultSetId },
	});

	// just doing this to shut up the linter because I want to check in what I
	// have for safety but work on this later.
	console.log(resultScores);

	return { headers, results };

};
