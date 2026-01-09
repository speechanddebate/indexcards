import db from '../../../data/db.js';
import { NotFound } from '../../../helpers/problem.js';

export const getTournIdByWebname = {
	GET: async (req, res) => {

		const webname = req.params.webname.replace(/\W/g, '');
		const reply = {
			tournId: 0,
			webname: '',
			multiYear: false,
		};

		// Find the most recent tournament that answers to that name.

		const results = await db.sequelize.query(`
			select
				tourn.id, tourn.webname
			from tourn
			where 1=1
				and (tourn.webname = :webname OR tourn.id = :webname)
			ORDER BY tourn.start DESC
			LIMIT 1
		`, {
			replacements: {webname},
			type         : db.sequelize.QueryTypes.SELECT,
		});

		if (results.length > 0) {

			const tourn = results[0];

			// If I'm searching by ID number, find the webname
			if (tourn.webname !== webname) {
				const nameCheck = await db.sequelize.query(`
					select
						tourn.id, tourn.webname
					from tourn
					where 1=1
						and tourn.webname = :webname
					ORDER BY tourn.start DESC
					LIMIT 1
				`, {
					replacements: {webname: tourn.webname},
					type         : db.sequelize.QueryTypes.SELECT,
				});

				if (nameCheck[0].id !== tourn.id) {
					// I am the current instance of webname
					reply.webname = tourn.webname;
					reply.tournId = tourn.id;
				} else {
					// I am not the current instance of webname, so all URLs must be ID encoded
					reply.webname = tourn.id.toString();
					reply.tournId = tourn.id;
				}

				if (nameCheck.length > 1) {
					reply.multiYear = true;
				}

			} else {
				// If I'm searching by webname, deliver the current ID number
				reply.webname = tourn.webname;
				reply.tournId = tourn.id;
				if (results.length > 1) {
					reply.multiYear = true;
				}
			}
		}
		return res.status(200).json(reply);
	},
};

export const getTournPublishedResults = {
	GET: async (req, res) => {
		const results = await db.sequelize.query(`
			select
				result_set.id, result_set.label name, result_set.bracket, result_set.generated,
				result_set.published, result_set.coach,
				event.id eventId, event.name eventName, event.abbr eventAbbr, event.type eventType,
				sweep_set.id sweepSetId, sweep_set.name sweepSetName,
				sweep_award.id sweepAwardId, sweep_award.name sweepAwardName

			from (result_set, tourn)
				left join event on result_set.event = event.id and event.type != 'attendee'
				left join sweep_set on result_set.sweep_set = sweep_set.id
				left join sweep_award on sweep_award.id = sweep_set.sweep_award

			where 1=1
				and result_set.tourn = :tournId
				and result_set.published = 1
				and tourn.id = result_set.tourn
				and tourn.hidden = 0
		`, {
			replacements : { tournId: req.params.tournId },
			type         : db.sequelize.QueryTypes.SELECT,
		});

		res.status(200).json(results);
	},
};

getTournPublishedResults.GET.apiDoc = {
	summary     : 'Returns an array of result_sets that are published in a tournament',
	operationId : 'getTournPublishedResults',
	parameters  : [
		{
			in          : 'path',
			name        : 'tournId',
			description : 'Tournament ID to return events for',
			required    : false,
			schema      : { type: 'string', minimum: 1 },
		},
	],
	responses: {
		200: {
			description: 'Array of events',
			content: {
				'application/json': {
					schema: {
						type: 'array',
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['invite', 'public', 'results'],
};

export const getResults = {

	GET: async (req, res) => {
		const resultSetData = await db.sequelize.query(`
			select
				rs.id rsId, rs.label rsName, rs.bracket rsBracket, rs.generated rsGenerated,
				rs.tag rsTag, rs.code rsCode, rs.qualifier rsQualifier,
				tourn.id tournId, tourn.name tournName, tourn.start tournStart,
				event.id eventId, event.name eventName, event.abbr eventAbbr, event.type eventType,
				circuit.id circuitId, circuit.name circuitName, circuit.abbr circuitAbbr
			from (result_set rs, tourn)
				left join event on rs.event = event.id
				left join circuit on rs.circuit = circuit.id
				left join sweep_set on rs.sweep_set = sweep_set.id
				left join sweep_award on rs.sweep_award = sweep_award.id
			where 1=1
				and rs.id = :rsId
				and rs.tourn = tourn.id
				and rs.published > 0
		`, {
			replacements : { roundId : req.params.resultSetId },
			type         : db.Sequelize.QueryTypes.SELECT,
		});

		if (resultSetData.length < 1) {
			return NotFound(req, res, `No result set found with ID ${req.params.resultSetID}`);
		}

		const resultSet = resultSetData[0];

		resultSet.results = await db.sequelize.query(`
			select
				result.id, result.rank, result.place, result.percentile,
				result.details details, result.raw_scores rawScores,
				entry.id entryId, entry.code entryCode, entry.name entryName,
				student.id studentId, student.first studentFirst, student.middle studentMiddle, student.last studentLast,
				school.id schoolId, school.chapter chapterId, school.name schoolName,
				chapter.id chapterId, chapter.formal formalName

			from (result)

				left join entry on entry.id         = result.entry
				left join student on student.id     = result.student
				left join school on school.id       = result.school
				left join chapter on school.chapter = chapter.id

			where 1=1
				and result.result_set = :resultSetId
		`, {
			replacements : { roundId : req.params.resultSetId },
			type         : db.Sequelize.QueryTypes.SELECT,
		});

		res.status(200).json(resultSet);
	},
};

getResults.GET.apiDoc = {
	summary     : 'Returns a result set for display as long as it is public',
	operationId : 'getResults',
	parameters  : [
		{
			in          : 'path',
			name        : 'tournId',
			description : 'Tournament ID to return events for',
			required    : false,
			schema      : { type: 'number', minimum: 1 },
		}, {
			in          : 'path',
			name        : 'resultSetId',
			description : 'Result Set ID to return results for',
			required    : false,
			schema      : { type: 'number', minimum: 1 },
		},
	],
	responses: {
		200: {
			description: 'Results JSON format for parsing into a table',
			content: {
				'application/json': {
					schema: {
						type: 'array',
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['invite', 'public', 'results'],
};

export const getEventByAbbr = {

	GET: async (req, res) => {
		const eventData = await db.sequelize.query(`
			select
				event.name eventName,
				event.id eventId,
				event.type eventType
			from event
			where 1=1
				and event.tourn = :tournId
				and event.abbr = :eventAbbr
		`, {
			replacements : { ...req.params },
			type         : db.Sequelize.QueryTypes.SELECT,
		});

		eventData.rounds = await db.sequelize.query(`
			select
				round.name roundNumber,
				round.id roundId,
				round.label roundLabel
				round.type roundType
			from round
			where 1=1
				and round.event = :eventId
				and round.published != 0
				order by round.name
		`, {
			replacements : { ...req.params },
			type         : db.Sequelize.QueryTypes.SELECT,
		});

		res.status(200).json(eventData);
	},
};

getEventByAbbr.GET.apiDoc = {
	summary     : 'Returns some limited data about an event together with published rounds by event abbreviation',
	operationId : 'getEventByAbbr',
	parameters  : [
		{
			in          : 'path',
			name        : 'tournId',
			description : 'Tournament ID to return events for',
			required    : true,
			schema      : { type: 'number', minimum: 1 },
		}, {
			in          : 'path',
			name        : 'eventAbbr',
			description : 'Human readable event abbreviation',
			required    : true,
			schema      : { type: 'string', minimum: 1 },
		},
	],
	responses: {
		200: {
			description: 'Event and Round in JSON format for parsing',
			content: {
				'application/json': {
					schema: {
						type: 'object',
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['invite', 'public', 'event', 'eventAbbr', 'rounds'],
};
