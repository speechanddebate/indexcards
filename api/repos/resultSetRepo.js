import db from '../data/db.js';
import { stripNulls, dbToObject } from '../helpers/text.js';

const buildResultSetQuery = ({opts = {}, scope = {}}) => {

	let limiter = {
		condition : '',
		joins     : '',
		fields    : '',
	};

	const query = {
		where: {},
		include: [],
	};

	if(opts.coach) {
		query.where.coach = 1;
		limiter.condition += 'and rs.coach = 1 ';
	} else if(!opts.unpublished){
		query.where.published = 1;
		limiter.condition += ' and rs.published = 1 ';
	}

	const conditionals = [];

	Object.keys(scope).forEach( (rawField) => {
		if (rawField === 'resultSetId') {
			limiter.condition += '\n and rs.id = :resultSetId ';
		} else if (rawField === 'tournId' && !scope.eventId) {
			limiter.fields += ', event';
			limiter.condition += '\n and rs.event = event.id and event.tourn = :tournId ';
			conditionals.push('event');
		} else {
			// invalid request.  BEGONE!
			limiter.condition += '\n and 1=2 ';
		}

		let field = rawField.replace('Id', '');
		if (scope.eventId) limiter.condition += ` and rs.${field} = :${rawField}`;
	});

	if (!conditionals.includes('event')) {
		limiter.joins = ' left join event on event.id = rs.event ';
	}

	return {query, limiter};
};

/*
 * Return a list of the published result sets given various parameters
 */

export const getResultSets = async (scope = {}, opts = {}) => {

	let { limiter } = buildResultSetQuery({opts, scope});

	const resultSetData = await db.sequelize.query(`
		select
			rs.id, rs.tag, rs.label, rs.published, rs.coach, rs.entity,
			rs.nsda_category rsNSDA,
			event.nsda_category eventNsdaCategory,
			event.id eventId, event.name eventName, event.abbr eventAbbr, event.level eventLevel,
			event.type eventType, rs.code eventCode,
			circuit.id circuitId, circuit.name circuitName, circuit.abbr circuitAbbr,
			rs.sweep_set sweepSet,
			rs.sweep_award sweepAward,
			rs.generated createdAt
		from (result_set rs ${limiter.fields})
			left join circuit on circuit.id = rs.circuit
			${limiter.joins}
		where 1=1
			${limiter.condition || 'and rs.published = 1'}
		group by rs.id
		order by event.nsda_category, rs.nsda_category, event.level, event.abbr, rs.generated DESC
	`, {
		type: db.Sequelize.QueryTypes.SELECT,
		replacements: { ...scope},
	});

	const events = {};

	resultSetData.forEach( (rs) => {

		let resultSet = { ...rs};
		const eventId = rs.eventId;
		resultSet = dbToObject(resultSet, 'event');

		// Process Event into standard format if there is one
		if (!events[eventId]) {
			if (resultSet.Event?.nsdaCategory && resultSet.rsNSDA) {
				resultSet.Event.nsdaCategory = resultSet.rsNSDA;
			}
			events[eventId] = {...resultSet.Event};
			events[eventId].ResultSets = [];
		}

		//Format Circuit too if there is one.
		if (resultSet.circuitId) resultSet = dbToObject(resultSet, 'circuit');

		delete resultSet.Event;
		delete resultSet.rsNSDA;
		delete resultSet.published;
		delete resultSet.coach;

		if (resultSet.bracket) resultSet.bracket = true;
		if (!resultSet.bracket) delete resultSet.bracket;

		events[eventId].ResultSets.push(stripNulls(resultSet));
	});

	return events;
};

// Return a single result set with full results.  Creates cached results where
// none exist.

export const getResultSet = async (scope = {}, query = {}, opts = {}) => {

	let { limiter } = buildResultSetQuery({opts, scope});

	const rsen = await db.sequelize.query(`
		select
			rs.id, rs.tag, rs.label, rs.published, rs.coach, rs.entity,
			rs.cache,
			rs.nsda_category rsNSDA,
			event.nsda_category eventNsdaCategory,
			event.id eventId, event.name eventName, event.abbr eventAbbr,
			event.level eventLevel, event.type eventType, rs.code eventCode,
			circuit.id circuitId, circuit.name circuitName, circuit.abbr circuitAbbr,
			rs.sweep_set sweepSet,
			rs.sweep_award sweepAward,
			rs.generated createdAt
		from (result_set rs ${limiter.fields})
			left join circuit on circuit.id = rs.circuit
			${limiter.joins}
		where 1=1
			${limiter.condition || 'and rs.published = 1'}
			and rs.id = :resultSetId
	`, {
		type         : db.Sequelize.QueryTypes.SELECT,
		replacements : { ...scope },
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
		resultSet = stripNulls(resultSet);

		if (query.nocache) delete resultSet.cache;

		let cache = {};

		if (resultSet.cache) {
			try {
				cache = JSON.parse(resultSet.cache);
			} catch (error) {
				cache = error;
				cache = {};
			}
		}

		if (Object.keys(cache).length > 0) {

			// If the results are already cached, deliver 'em up.
			if (cache.headers) resultSet.headers = cache.headers;
			if (cache.rounds) resultSet.rounds   = cache.rounds;

			delete resultSet.cache;

			const rawResults = await db.sequelize.query(`
				select
					result.rank,
					result.place,
					result.percentile,
					result.cache,
					result.panel section
				from result
				where 1=1
					and result_set = :resultSetId
					order by result.rank
			`, {
				replacements : {resultSetId: resultSet.id},
				type         : db.Sequelize.QueryTypes.SELECT,
			});

			resultSet.results = rawResults.map( (result) => {
				if (query.nocache) delete result.cache;

				if (result.cache) {
					cache = JSON.parse(result.cache);
					Object.keys(cache).forEach( (key) => {
						result[key] = cache[key];
					});
					delete result.cache;
				}
				return stripNulls(result);
			});

		} else {

			// If the results are not cached, generate them here and save them to
			// the cache for next time. The cache generator will save the result
			// specific ones (scores and values).

			let newCache = {};

			if (resultSet.tag === 'bracket') {

				newCache = await createBracketCache( resultSet );
				if (newCache.rounds) resultSet.rounds = newCache.rounds;

			} else {

				newCache = await createResultCache( resultSet );

				if (newCache.headers) resultSet.headers = newCache.headers;

				// These are already cached in the results, so do not save them
				// to the result_set, but available now.

				if (newCache.results) {
					resultSet.results = newCache.results;
					delete newCache.results;
				}
			}

			await db.sequelize.query(`
				update result_set set cache = :cache where id = :resultSetId
			`, {
				replacements: {
					cache       : JSON.stringify({ ...newCache }),
					resultSetId : resultSet.id,
				},
				type: db.Sequelize.QueryTypes.UPDATE,
			});

			delete resultSet.cache;
		}

		if (!resultSet.results[0]?.place > 0) {
			resultSet.noPlacement = true;
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
			entrySchool.id entrySchoolId, entrySchool.code entrySchoolCode, entrySchool.name entrySchoolName,
			student.id studentId, student.first studentFirst, student.last studentLast,
				student.middle studentMiddle,
			(select round.name from round where round.id = result.round) as roundName,
			section.letter section
		from (result)
			left join school on school.id = result.school
			left join student on student.id = result.student
			left join entry on entry.id = result.entry
			left join school entrySchool on entrySchool.id = entry.school
			left join panel section on section.id = result.panel
		where 1=1
			and result.result_set = :resultSetId
			order by result.rank
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

	console.log(`I should be here`);

	const headersById = {};
	rawHeaders.forEach( (header) => {
		console.log(`I have tag ${header.tag} id ${header.id}`);

		headersById[header.id] = {
			tag         : header.tag,
			description : header.description,
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

		if (!results[rv.result]) results[rv.result] = {};
		if (!results[rv.result].values)		results[rv.result].values = {};
		const sortedHeader = idToKey[rv.header];
		results[rv.result].values[sortedHeader] = rv.value;
	});

	// Raw scores that went into the creation of this set, when they exist.
	// Skipping school based raw scores for now since they are far too complex
	// to calculate if they are not in the initial set.

	// Actually I'm reconsidering.  This leads to a lot of duplicated data and
	// if a tournament wants to release raw scores there is a result set for
	// that.  Skipping this for now but leaving it here for when I flip flop
	// again. So set it to skip if 1=1 and then wait.

	if (
		// eslint-disable-next-line no-constant-binary-expression
		1 === 1
		|| resultSet.entity === 'school'
		|| resultSet.tag == 'sweeps'
		|| resultSet.tag == 'scores'
	) {

		// No scores for schools because dear Lord that's complex.
		// Eventually the score generator should itself save the per entry
		// scoring.

		// And if the report itself is scores, then duh.

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

				const cleanScore = stripNulls(score, ['winloss']);

				const resultId = cleanScore.resultId;
				delete cleanScore.resultId;

				const roundName = cleanScore.roundName;
				delete cleanScore.roundName;

				if (!results[resultId].scores) 	results[resultId].scores = {};
				if (!results[resultId].scores[roundName]) 	results[resultId].scores[roundName] = [];

				if (cleanScore.tag === 'winloss') {
					if (cleanScore.value) cleanScore.value = 'W';
					if (!cleanScore.value) cleanScore.value = 'L';
				}
				cleanScore[cleanScore.tag] = cleanScore.value || 0;
				delete cleanScore.tag;
				delete cleanScore.value;
				results[resultId].scores[roundName].push(cleanScore);
			});
		}
	}

	const promises = []; // batch process the updates pls

	Object.keys(results).forEach( (resultId) => {

		const promise = db.sequelize.query(`
			update result set cache = :cache where id = :resultId
		`, {
			replacements : {
				cache    : JSON.stringify(results[resultId]),
				resultId,
			},
			type: db.Sequelize.QueryTypes.UPDATE,
		});
		promises.push(promise);
	});

	await Promise.all(promises);

	// There really isn't much need for all those ID number keys.
	const resultArray = Object.keys(results).map( (resultId) => {
		return results[resultId];
	});

	return {headers: headersByKey, results: resultArray};
};

const createBracketCache = async (resultSet) => {

	if (resultSet.tag !== 'bracket') return {error: 'Result set not valid for bracketing'};

	// Brackets are totally different. The old system used to just consult the
	// rounds in the system but since I'm trying to use result sets as a data
	// independent thing, recreate that here.

	const rawSections = await db.sequelize.query(`
		select
			round.id roundId, round.name roundName, round.label roundLabel,
			round.type roundType,
			panel.id panelId, panel.letter, panel.bracket,
			panel.bye, ballot.side,
			entry.id entryId, entry.code entryCode,
			(select room.name from room where panel.room = room.id) as roomName
		from (round, panel, ballot, entry)
			where 1=1
			and round.event = :eventId
			and round.type IN ('elim', 'final')
			and round.published IN (1, 2)
			and round.id = panel.round
			and panel.id = ballot.panel
			and ballot.entry = entry.id
		group by entry.id, round.id
		order by round.name, panel.bracket, ballot.side
	`, {
		replacements: { eventId: resultSet.Event.id },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	const rounds = {};
	let order = 1;

	rawSections.forEach( (resultData) => {

		if (!rounds[resultData.roundName]) {
			rounds[resultData.roundName] = {
				label : resultData.roundLabel || `Round ${resultData.roundName}`,
				type  : resultData.roundType,
				order,
				Sections : {},
			};
			order++;
		}

		const round = stripNulls(rounds[resultData.roundName]);

		if (!round.Sections[resultData.bracket]) {
			round.Sections[resultData.bracket] = {
				letter  : resultData.letter,
				bye     : resultData.bye,
				room    : resultData.roomName,
				Entries : {},
			};
		}

		const section = stripNulls(round.Sections[resultData.bracket]);

		// CHAIN OF DOOM
		section.Entries[resultData.side] = {
			id   : resultData.entryId,
			code : resultData.entryCode,
		};

		round.Sections[resultData.bracket] = section;
		rounds[resultData.roundName] = round;

	});

	await db.sequelize.query(`
		update result_set set cache = :cache where id = :resultSetId
	`, {
		replacements: {
			cache       : JSON.stringify({ rounds }),
			resultSetId : resultSet.id,
		},
		type: db.Sequelize.QueryTypes.UPDATE,
	});

	return { rounds };
};

const mapResults = (rawResults) => {

	const results = {};

	rawResults.forEach( (result) => {

		if (result.schoolId) {
			result.School = {
				id   : result.schoolId,
				code : result.schoolCode,
				name : result.schoolName,
			};
			delete result.schoolId;
			delete result.school;
			delete result.schoolName;
			delete result.schoolCode;
			result.entityName = result.schoolName;
		}

		if (result.entryId) {

			result.Entry = {
				id   : result.entryId,
				code : result.entryCode,
				name : result.entryName,
			};

			if (result.entrySchoolId) {
				result.School = {
					id   : result.entrySchoolId,
					code : result.entrySchoolCode,
					name : result.entrySchoolName,
				};

				delete result.entrySchoolId;
				delete result.entrySchoolCode;
				delete result.entrySchoolName;
			}

			delete result.entryId;
			delete result.entry;
			delete result.entryName;
			delete result.entryCode;
			result.entityName = result.entryCode;
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
			delete result.student;
			delete result.studentFirst;
			delete result.studentMiddle;
			delete result.studentLast;
		}

		if (result.cache) {
			result.values = result.cache.values;
		}

		delete result.cache;
		delete result.timestamp;
		delete result.created_at;
		delete result.result_set;
		results[result.id] = stripNulls(result);
		delete results[result.id].id;
	});

	return results;
};
