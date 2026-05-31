import db from '../data/db.js';
import { eventInclude } from './eventRepo.js';

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
	let joinEvent = '';

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

		if (!limiterFields) {
			joinEvent = 'left join event on event.id = rs.event';
		}

		let field = rawField.replace('Id', '');
		if (scope.eventId) limiter += ` and rs.${field} = :${rawField}`;
	});

	const rsen = await db.sequelize.query(`
		select
			rs.id, rs.tag, rs.label, rs.published, rs.coach, rs.entity,
			rs.cache,
			rs.nsda_category rsNSDA,
			event.nsda_category nsdaCategory,
			event.id eventId, event.abbr eventAbbr, event.type eventType, rs.code eventCode,
			circuit.id, circuit.name circuitName, circuit.abbr circuitAbbr,
			rs.sweep_set sweepSet,
			rs.sweep_award sweepAward,
			rs.generated createdAt
		from result_set rs ${limiterFields}
			left join circuit on circuit.id = rs.circuit
			${joinEvent}
		where 1=1
			${limiter}
	`, {
		type: db.Sequelize.QueryTypes.SELECT,
		replacements: { ...scope},
	});

	const resultSets = [];

	rsen.forEach( async (rs) => {

		// Process Event into standard format if there is one
		if (rs.eventId) {
			rs.Event = {
				id           : rs.eventId,
				name         : rs.eventName,
				abbr         : rs.eventAbbr,
				type         : rs.eventType,
				code         : rs.eventCode,
				nsdaCategory : rs.rsNSDA || rs.nsdaCategory,
			};
		}

		//Format Circuit too if there is one.
		if (rs.circuitId) {
			rs.Circuit = {
				id   : rs.circuitId,
				name : rs.circuitName,
				abbr : rs.circuitAbbr,
			};
		}

		// May want to do some formatting with SweepAward here too??

		// Prune out null values and booleans
		['bracket', 'published', 'coach'].forEach( (tag) => {
			if (rs[tag]) {
				rs[tag] = true;
			} else {
				rs[tag] = false;
			}
		});

		if (rs.cache?.headers) {

			// If the results are already cached, deliver 'em up.
			rs.headers = rs.cache.headers;
			delete rs.cache;

			const rawResults = await db.sequelize.query(`
				select
					result.*
				from result
				where 1=1
					and result_set = :resultSetId
					order by result.rank
			`, {
				replacements : {resultSetId: rs.id},
				type         : db.Sequelize.QueryTypes.SELECT,
			});

			rs.results = mapResults(rawResults);

		} else {

			// If the results are not cached, generate them here and save them to
			// the cache for next time. The cache generator will save the result
			// specific ones (scores and values).

			const { headers, results } = await createResultCache( rs );
			rs.headers = headers; rs.results = results;

			await db.sequelize.query(`
				update results_set set cache = :cache where id = :resultSetId
			`, {
				replacements: {
					cache       : {headers: rs.headers, results: rs.results},
					resultSetId : rs.id,
				},
				type: db.Sequelize.QueryTypes.UPDATE,
			});
		}

		resultSets.push(rs);
	});

	return resultSets;
};

export default {
	getResultSet,
	getResultSets,
};

// This function takes the not-great syntax I had for the results sets up to
// this point and converts to the faster access JSON blob.

const createResultCache = async (resultSet) => {

	// We're not going to be fancy with the joins here. Just pull the raw data
	// for once and process it in code, Palmer.

	const rawResults = await db.sequelize.query(`
		select
			result.*,
			entry.id entryId, entry.code entryCode, entry.name entryName,
			school.id schoolId, school.code schoolCode, school.name schoolName,
			student.id studentId, student.first studentFirst, student.last studentLast,
				student.middle studentMiddle,
			(select round.name from round where round.id = result.round) as roundName
		from (result)
			left join school on school.id = result.school
			left join student on student.id = result.student
			left join entry on entry.id = result.entry
		where 1=1
			and result.result_set = ?
			order by entry.code
	`, {
		replacements: { resultSetId: resultSet.id },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	const results = mapResults(rawResults);

	const rawHeaders = await db.sequelize.query(`
		select rk.*
		from (result_key rk)
		where 1=1
			and rk.result_set = ?
	`, {
		replacements: { resultSetId: resultSet.id },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	const headersById = {};
	rawHeaders.forEach( (header) => {
		headersById[header.id] = header;
	});

	// The raw values will later be shuffled into the results rows and
	// represent the individual scores for each header the entity has, where it
	// exists.

	const rawValues = await db.sequelize.query(`
		select rv.id, rv.value, rv.result_key header, rv.priority,
			protocol.id protocolId, protocol.name protocolName
		from (result_value rv, result)
		where 1=1
			and result.result_set = ?
			and result.id = result_value.result
		order by result.rank, rv.priority
	`, {
		replacements: { resultSetId: resultSet.id },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	let headerKey      = 1;
	const idToKey      = {};
	const headersByKey = {};

	// Pull the raw values from the old format.  Eventually these will be
	// generated with the result set itself and this can go the way of the dodo
	// but for now...

	rawValues.forEach( (rv) => {

		// 999 was the Terrible, Horrible, No Good, Very Bad way of handling
		// raw scores that I once "designed."  I cannot even blame Jon for this
		// one, unfortunately. I'm going to pull from scratch because otherwise
		// I'd have to look at the current away again and I will not.

		if (rv.priority === 999) return;

		if (!idToKey[rv.header]) {
			const header = headersById[rv.header];
			headersByKey[header.priority] = header;
			idToKey[rv.header] = headerKey;
		}

		results[rv.result].values[rv.priority] = {
			...rv,
			header: idToKey[rv.header],
		};
	});

	// Raw scores that went into the creation of this set, when they exist.
	// Skipping school based raw scores for now since they are far too complex
	// to calculate if they are not in the initial set.

	let rawScores = [];

	if (resultSet.entity === 'student') {

		rawScores = await db.sequelize.query(`
			select
				round.name roundName,
				panel.bye,
				ballot.chair, ballot.bye ballotBye, ballot.forfeit,
				score.tag, score.value,
				result.id resultId
			from (result, ballot, panel, round, entry_student, student)
				left join score
					on score.ballot = ballot.id
					and score.tag IN ('winloss', 'rank', 'point', 'refute', 'po')
					and (score.student = student.id OR score.student IS NULL OR score.student = 0)
			where 1=1
				and result.result_set = :resultSetId
				and result.entry = ballot.entry
				and ballot.panel = panel.id
				and panel.round = round.id
			order by ballot.entry, round.name,
				ballot.chair, ballot.judge,
				CASE score.tag
					WHEN 'winloss' then 1
					when 'rank' then 2
					when 'point' then 3
					when 'refute' then 4
					when 'po' then 5
		`, {
			replacements: { resultSetId: resultSet.id },
			type: db.Sequelize.QueryTypes.SELECT,
		});

	} else if (resultSet.entity === 'school') {

		// No scores for schools because dear Lord that's complex. Eventually
		// the score generator should itself save the per entry scoring.

	} else {

		// By default it should be by entry, thats the majority of these.

		rawScores = await db.sequelize.query(`
			select
				round.name roundName,
				panel.bye,
				ballot.chair, ballot.bye ballotBye, ballot.forfeit,
				score.tag, score.value,
				result.id resultId,
				student.first studentFirst, studentlast studentLast
			from (result, ballot, panel, round)
				left join score
					on score.ballot = ballot.id
					and score.tag IN ('winloss', 'rank', 'point', 'refute', 'po')
				left join student
					on score.student = student.id
			where 1=1
				and result.result_set = :resultSetId
				and result.entry = ballot.entry
				and ballot.panel = panel.id
				and panel.round = round.id
			order by ballot.entry, round.name,
				ballot.chair, ballot.judge,
				CASE score.tag
					WHEN 'winloss' then 1
					when 'rank' then 2
					when 'point' then 3
					when 'refute' then 4
					when 'po' then 5
		`, {
			replacements: { resultSetId: resultSet.id },
			type: db.Sequelize.QueryTypes.SELECT,
		});
	}

	if (rawScores.length > 1) {
		rawScores.forEach( (score) => {

			Object.keys(score).forEach( (key) => {
				if (!score[key] || score[key] === 'null') {
					delete score[key];
				}
			});

			const resultId = score.resultId;
			delete score.resultId;

			const roundName = score.roundName;
			delete score.roundName;

			if (!results[resultId].scores) 	results[resultId].scores = {};
			if (!results[resultId].scores[roundName]) 	results[resultId].scores[roundName] = [];

			results[resultId].scores[roundName].push(score);
		});
	}

	// Now save the individual values to the results table; the headers go into
	// the results_set

	const promises = []; // batch process the updates pls

	results.forEach( (result) => {
		const promise = db.sequelize.query(`
			update result set cache = :cache where id = :resultId
		`, {
			replacements : {
				cache    : { values: result.values, scores: result.scores },
				resultId : result.id,
			},
			type: db.Sequelize.QueryTypes.UPDATE,
		});

		promises.push(promise);
	});

	await Promise.all(promises);
	return {headers: headerKey, results};
};

const mapResults = (rawResults) => {

	const results = {};

	rawResults.forEach( (result) => {
		if (result.entryId) {
			result.entityName = result.entryName;
			result.Entry = {
				id   : result.entryId,
				code : result.entryCode,
				name : result.entryName,
			};
			delete result.entryId;
			delete result.entryName;
			delete result.entryCode;
		}

		if (result.schoolId) {
			result.entityName = result.schoolName;
			result.Entry = {
				id   : result.schoolId,
				code : result.schoolCode,
				name : result.schoolName,
			};
			delete result.schoolId;
			delete result.schoolName;
			delete result.schoolCode;
		}

		if (result.studentId) {
			result.Student = {
				id     : result.studentId,
				first  : result.studentFirst,
				middle : result.studentmiddle,
				last   : result.studentLast,
			};
			result.entityName = `${result.studentFirst} ${result.studentMiddle} ${result.studentLast}`;
			result.entityName = result.entityName.replace(/  +/g, ' ');;
			delete result.studentId;
			delete result.studentFirst;
			delete result.studentMiddle;
			delete result.studentLast;
		}

		if (result.cache) {
			result.values = result.cache.values;
			result.scores = result.cache.scores;
		}

		delete result.cache;
		Object.keys(result).forEach( (key) => {
			if (!result[key] || result[key] === 'null') {
				delete result[key];
			}
		});

		results[result.id] = result;
	});

	return results;
};