import db from '../../../data/db.js';
import { NotFound } from '../../../helpers/problem.js';

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