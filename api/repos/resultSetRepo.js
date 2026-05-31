import db from '../data/db.js';
import { dbToObject } from '../helpers/text.js';
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
 * Return a list of the published result sets given various parameters
 */

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
			rs.nsda_category rsNSDA,
			event.nsda_category eventNsdaCategory,
			event.id eventId, event.name eventName, event.abbr eventAbbr, event.type eventType, rs.code eventCode,
			circuit.id circuitId, circuit.name circuitName, circuit.abbr circuitAbbr,
			rs.sweep_set sweepSet,
			rs.sweep_award sweepAward,
			rs.generated createdAt
		from (result_set rs ${limiterFields})
			left join circuit on circuit.id = rs.circuit
			${joinEvent}
			and rs.published = 1
		where 1=1
			${limiter}
	`, {
		type: db.Sequelize.QueryTypes.SELECT,
		replacements: { ...scope},
	});

	return rsen.map( (rs) => {

		let resultSet = { ...rs};

		// Process Event into standard format if there is one
		if (resultSet.eventId) resultSet = dbToObject(resultSet, 'event');

		if (resultSet.Event &! resultSet.Event.nsdaCategory && resultSet.resultSetNSDA) {
			resultSet.Event.nsdaCategory = resultSet.resultSetNSDA;
		} else {
			delete resultSet.rsNSDA;
		}

		//Format Circuit too if there is one.
		if (resultSet.circuitId) resultSet = dbToObject(resultSet, 'circuit');

		delete resultSet.published;
		delete resultSet.coach;

		if (resultSet.bracket) resultSet.bracket = true;
		if (!resultSet.bracket) delete resultSet.bracket;

		Object.keys(resultSet).forEach( (key) => {
			if (!resultSet[key] || resultSet[key] === 'null') {
				delete resultSet[key];
			}
		});

		return resultSet;
	});
};

/**
 *
 * Return a single result set with full results.  Creates cached results where
 * none exist.
 **/

export const getResultSet = async (resultSetId) => {

	const rsen = await db.sequelize.query(`
		select
			rs.id, rs.tag, rs.label, rs.published, rs.coach, rs.entity,
			rs.cache,
			rs.nsda_category rsNSDA,
			event.nsda_category eventNsdaCategory,
			event.id eventId, event.name eventName, event.abbr eventAbbr, event.type eventType, rs.code eventCode,
			circuit.id circuitId, circuit.name circuitName, circuit.abbr circuitAbbr,
			rs.sweep_set sweepSet,
			rs.sweep_award sweepAward,
			rs.generated createdAt
		from (result_set rs)
			left join circuit on circuit.id = rs.circuit
			left join event on event.id = rs.event
		where 1=1
			and rs.published = 1
			and rs.id = :resultSetId
	`, {
		type: db.Sequelize.QueryTypes.SELECT,
		replacements: { resultSetId },
	});

	const resultSets = [];

	for (const rs of rsen) {

		let resultSet = { ...rs };

		// Process Event into standard format if there is one
		if (resultSet.eventId) resultSet = dbToObject(resultSet, 'event');
		if (resultSet.Event &! resultSet.Event.nsdaCategory && resultSet.resultSetNSDA) {
			resultSet.Event.nsdaCategory = resultSet.resultSetNSDA;
		} else {
			delete resultSet.rsNSDA;
		}

		if (resultSet.circuitId) resultSet = dbToObject(resultSet, 'circuit');

		delete resultSet.published;
		delete resultSet.coach;

		if (resultSet.bracket) resultSet.bracket = true;
		if (!resultSet.bracket) delete resultSet.bracket;

		Object.keys(resultSet).forEach( (key) => {
			if (!resultSet[key] || resultSet[key] === 'null') {
				delete resultSet[key];
			}
		});

		let cache = {};
		if (resultSet.cache) cache = JSON.parse(resultSet.cache);

		if (Object.keys(cache).length > 0) {

			// If the results are already cached, deliver 'em up.
			resultSet.headers = cache.headers;
			delete resultSet.cache;

			const rawResults = await db.sequelize.query(`
				select
					result.*
				from result
				where 1=1
					and result_set = :resultSetId
					order by result.rank
			`, {
				replacements : {resultSetId: resultSet.id},
				type         : db.Sequelize.QueryTypes.SELECT,
			});

			resultSet.results = mapResults(rawResults);

		} else {

			// If the results are not cached, generate them here and save them to
			// the cache for next time. The cache generator will save the result
			// specific ones (scores and values).

			const { headers, results } = await createResultCache( resultSet );
			resultSet.headers = headers;
			resultSet.results = results;

			await db.sequelize.query(`
				update result_set set cache = :cache where id = :resultSetId
			`, {
				replacements: {
					cache       : JSON.stringify({ headers }),
					resultSetId : resultSet.id,
				},
				type: db.Sequelize.QueryTypes.UPDATE,
			});

			delete resultSet.cache;
		}

		resultSets.push(resultSet);
	};

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
			and result.result_set = :resultSetId
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
			and rk.result_set = :resultSetId
	`, {
		replacements: { resultSetId: resultSet.id },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	const headersById = {};
	rawHeaders.forEach( (header) => {

		headersById[header.id] = {
			tag         : header.tag,
			description : header.description,
			sortable    : true,
		};

		if (header.no_sort)  headersById[header.id].sortable     = false;
		if (header.sort_desc)  headersById[header.id].descending = true;
	});

	// The raw values will later be shuffled into the results rows and
	// represent the individual scores for each header the entity has, where it
	// exists.

	const rawValues = await db.sequelize.query(`
		select rv.id, rv.value, rv.result,
			rv.result_key header, rv.priority,
			protocol.id protocolId, protocol.name protocolName
		from (result_value rv, result)
			left join protocol on rv.protocol = protocol.id
		where 1=1
			and result.result_set = :resultSetId
			and result.id = rv.result
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
			headersByKey[headerKey] = header;

			if (rv.protocolName) {
				headersByKey[headerKey].Protocol = {
					id: rv.protocolId,
					name: rv.protocolName,
				};
			}

			idToKey[rv.header] = headerKey;
			headerKey++;
		}

		delete rv.protocolId;
		delete rv.protocolName;
		if (!results[rv.result].values)		results[rv.result].values = {};

		const sortedHeader = idToKey[rv.header];
		delete rv.header;
		delete rv.priority;
		results[rv.result].values[sortedHeader] = { ...rv };
	});

	// Raw scores that went into the creation of this set, when they exist.
	// Skipping school based raw scores for now since they are far too complex
	// to calculate if they are not in the initial set.

	if (resultSet.entity === 'school' || resultSet.tag == 'sweeps') {

		// No scores for schools because dear Lord that's complex. Eventually
		// the score generator should itself save the per entry scoring.

	} else {

		let studentLimiter = '';
		if (resultSet.entity === 'student') {
			studentLimiter = 'and (score.student = result.student OR result.student IS NULL OR result.student = 0)';
		}

		const rawScores = await db.sequelize.query(`
			select
				round.name roundName,
				panel.bye,
				ballot.judge judgeId,
				ballot.chair, ballot.bye ballotBye, ballot.forfeit,
				score.tag, score.value,
				result.id resultId,
				score.student studentId
			from (result, ballot, panel, round)
				left join score
					on score.ballot = ballot.id
					and score.tag IN ('winloss', 'rank', 'point', 'refute', 'po')
					${studentLimiter}
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
				END
		`, {
			replacements: { resultSetId: resultSet.id },
			type: db.Sequelize.QueryTypes.SELECT,
		});

		if (rawScores.length > 1) {
			rawScores.forEach( (score) => {

				Object.keys(score).forEach( (key) => {
					if (
						key !== 'winloss'
						&& (!score[key] || score[key] === 'null')
					) {
						delete score[key];
					}
				});

				const resultId = score.resultId;
				delete score.resultId;

				const roundName = score.roundName;
				delete score.roundName;

				if (!results[resultId].scores) 	results[resultId].scores = {};
				if (!results[resultId].scores[roundName]) 	results[resultId].scores[roundName] = [];

				if (score.tag === 'winloss') {
					if (score.value) score.value = 'W';
					if (!score.value) score.value = 'L';
				}
				score[score.tag] = score.value || 0;
				delete score.tag;
				delete score.value;
				results[resultId].scores[roundName].push(score);
			});
		}
	}

	const promises = []; // batch process the updates pls

	Object.keys(results).forEach( (resultId) => {
		const promise = db.sequelize.query(`
			update result set cache = :cache where id = :resultId
		`, {
			replacements : {
				cache    : JSON.stringify({
					values: results[resultId].values,
					scores: results[resultId].scores,
				}),
				resultId,
			},
			type: db.Sequelize.QueryTypes.UPDATE,
		});
		promises.push(promise);
	});

	await Promise.all(promises);

	return {headers: headersByKey, results};
};

const mapResults = (rawResults) => {

	const results = {};

	rawResults.forEach( (result) => {

		if (result.entryId) {
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

		delete result.timestamp;
		delete result.created_at;
		delete result.result_set;

		results[result.id] = result;
	});

	return results;
};