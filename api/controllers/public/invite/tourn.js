import { shortZone } from '../../../helpers/dateTime.js';
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

		const results = await req.db.sequelize.query(`
			select
				tourn.id, tourn.webname
			from tourn
			where 1=1
				and (tourn.webname = :webname OR tourn.id = :webname)
			ORDER BY tourn.start DESC
			LIMIT 1
		`, {
			replacements: {webname},
			type         : req.db.sequelize.QueryTypes.SELECT,
		});

		if (results.length > 0) {

			const tourn = results[0];

			// If I'm searching by ID number, find the webname
			if (tourn.webname !== webname) {
				const nameCheck = await req.db.sequelize.query(`
					select
						tourn.id, tourn.webname
					from tourn
					where 1=1
						and tourn.webname = :webname
					ORDER BY tourn.start DESC
					LIMIT 1
				`, {
					replacements: {webname: tourn.webname},
					type         : req.db.sequelize.QueryTypes.SELECT,
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

export const getTournInvite = {
	GET: async (req, res) => {

		const db = req.db;
		const invite = {};

		if (! isNaN(parseInt(req.params.tournId))) {

			const result = await db.tourn.findByPk(parseInt(req.params.tournId));
			invite.tourn = result.get({ plain: true });

		} else if (req.params.tournId) {

			const webname = req.params.tournId.replace(/\W/g, '');

			try {

				// Find the most recent tournament that answers to that name.
				const result = await db.tourn.findOne({
					where : { webname, hidden: 0 },
					order : [['start', 'desc']],
					limit : 1,
				});

				invite.tourn = result.get({ plain: true });

			} catch (err) {
				console.log(err);
			}
		}

		if (!invite.tourn?.id || invite.tourn?.hidden) {
			return NotFound(req, res, 'No such tournament found');
		}

		invite.pages = await db.webpage.findAll({
			where: {
				tourn     : invite.tourn.id,
				published : 1,
			},
			raw: true,
			order: ['page_order'],
		});

		invite.files = await db.file.findAll({
			where: {
				tourn     : invite.tourn.id,
				published : 1,
			},
			raw: true,
			order: ['tag', 'label'],
		});

		invite.events = await db.sequelize.query(`
			select
				event.id, event.abbr, event.name, event.fee, event.type,
				category.id categoryId, category.name categoryName, category.abbr categoryAbbr,
				judge_field_report.value judgeFieldReport,
				cap.value cap,
				school_cap.value schoolCap,
				topic.source topicSource, topic.event_type topicEventType, topic.tag topicTag,
				topic.topic_text topicText,
				field_report.value fieldReport,
				anonymous_public.value anonymousPublic,
				live_updates.value liveUpdates,
				description.value_text description,
				currency.value currency,
				count(entry.id) as entryCount,
				nsda_event_category.value nsdaCode,
				nsda_category.name nsdaName

			from (event, tourn, category)

				left join entry on entry.event = event.id and entry.active = 1

				left join tourn_setting currency
					on currency.tourn = tourn.id
					and currency.tag = 'currency'

				left join event_setting nsda_event_category
					on nsda_event_category.tag = 'nsda_event_category'
					and nsda_event_category.event = event.id

				left join nsda_category
					on nsda_category.code = nsda_event_category.value

				left join event_setting cap
					on cap.event = event.id
					and cap.tag = 'cap'

				left join event_setting school_cap
					on school_cap.event = event.id
					and school_cap.tag = 'school_cap'

				left join category_setting judge_field_report
					on judge_field_report.category = category.id
					and judge_field_report.tag = 'field_report'

				left join event_setting field_report
					on field_report.event = event.id
					and field_report.tag = 'field_report'

				left join event_setting live_updates
					on live_updates.event = event.id
					and live_updates.tag = 'live_updates'

				left join event_setting anonymous_public
					on anonymous_public.event = event.id
					and anonymous_public.tag = 'anonymous_public'

				left join event_setting description
					on description.event = event.id
					and description.tag = 'description'

				left join event_setting topic_id
					on topic_id.event = event.id
					and topic_id.tag = 'topic'

				left join topic on topic.id = topic_id.value

			where 1=1
				and tourn.id = :tournId
				and event.tourn = tourn.id
				and event.type != 'attendee'
				and tourn.hidden = 0
				and event.category = category.id
			group by event.id
		`, {
			replacements : { tournId: invite.tourn.id },
			type         : db.sequelize.QueryTypes.SELECT,
		});

		invite.contacts = await db.sequelize.query(`
			select
				person.id, person.first, person.middle, person.last, person.email

			from (person, permission, tourn)

			where 1=1
				and permission.tourn  = :tournId
				and permission.tag    = 'contact'
				and permission.person = person.id
				and permission.tourn  = tourn.id
				and tourn.hidden      = 0
		`, {
			replacements : { tournId: invite.tourn.id },
			type         : db.sequelize.QueryTypes.SELECT,
		});

		const promises = [];
		promises.push(invite.events);
		await Promise.all(promises);

		if (invite.tourn.city === 'NSDA Campus'
			|| invite.tourn.city === 'Online'
		) {
			const tournTZ = shortZone(invite.tourn.tz, new Date(invite.tourn.start));
			invite.tourn.location = `${invite.tourn.city} (${tournTZ})`;
		} else {
			invite.tourn.location = `${invite.tourn.city}`;
			if (invite.tourn.state) {
				invite.tourn.location += `, ${invite.tourn.state}`;
			} else if (invite.tourn.country) {
				invite.tourn.location += `, ${invite.tourn.country}`;
			}
		}

		return res.status(200).json(invite);
	},
};

getTournInvite.GET.apiDoc = {

	summary     : 'Returns the public pages for a tournament',
	operationId : 'getTournInvite',
	parameters  : [
		{
			in          : 'path',
			name        : 'tournId',
			description : 'Tournament ID of tournament to return',
			required    : false,
			schema      : { type: 'string', minimum: 1 },
		},
	],
	responses: {
		200: {
			description: 'Invitational & General Tournament Info',
			content: { '*/*': { schema: { $ref: '#/components/schemas/Invite' } } },
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['invite', 'public'],
};

export const getTournPublishedFiles = {
	GET: async (req, res) => {
		const db = req.db;
		const files = await db.sequelize.query(`
			select
				id, tag, type, label, filename, published, coach, page_order,
				parent, webpage, timestamp
			from (file, tourn)
			where 1=1
				and file.published = 1
				and file.tourn     = tourn.id
				and tourn.id       = :tournId
				and tourn.hidden   = 0
		`, {
			replacements : { tournId: req.params.tournId },
			type         : db.sequelize.QueryTypes.SELECT,
		});
		res.status(200).json(files);
	},
};

export const getTournEvents = {
	GET: async (req, res) => {
		const db = req.db;
		const events = await db.sequelize.query(`
			select
				event.id, event.abbr, event.name, event.fee, event.type,
				cap.value cap,
				school_cap.value school_cap,
				topic.source topic_source, topic.event_type topic_event_type, topic.tag topic_tag,
				topic.text topic_text,
				field_report.value field_report,
				description.value_text description

			from (event, tourn)

				left join event_setting cap
					on cap.event = event.id
					and cap.tag = 'cap'

				left join event_setting school_cap
					on school_cap.event = event.id
					and school_cap.tag = 'school_cap'

				left join event_setting field_report
					on field_report.event = event.id
					and field_report.tag = 'field_report'

				left join event_setting description
					on description.event = event.id
					and event_description.tag = 'description'

				left join event_setting topic_id
					on topic_id.event = event.id
					and topic_id.tag = 'topic'

				left join topic on topic.id = topic_id.value

			from event
			where 1=1
				and event.type != 'attendee'
				and event.tourn = tourn.id
				and tourn.id = :tournId
				and tourn.hidden = 0
		`, {
			replacements : { tournId: req.params.tournId },
			type         : db.sequelize.QueryTypes.SELECT,
		});
		res.status(200).json(events);
	},
};

getTournEvents.GET.apiDoc = {
	summary     : 'Returns an array of events in a tournament',
	operationId : 'getTournEvents',
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
	tags: ['invite', 'public', 'rounds'],
};

export const getTournPublishedRounds = {

	GET: async (req, res) => {

		const db = req.db;
		const rawRounds = await db.sequelize.query(`
			select
				round.id roundId, round.name roundName, round.label roundLabel, round.type roundType,
					round.published,
					round.post_primary roundPostPrimary,
					round.post_secondary roundPostSecondary,
					round.post_feedback roundPostFeedback,
				event.id eventId, event.name eventName, event.abbr eventAbbr, event.type eventType,
				event.level eventLevel,
				nsda_event_category.value eventNSDACode

			from (round, event, tourn)

				left join event_setting nsda_event_category
					on nsda_event_category.tag = 'nsda_event_category'
					and nsda_event_category.event = event.id

			where 1=1
				and event.tourn  = :tournId
				and event.id     = round.event
				and event.tourn  = tourn.id
				and tourn.hidden = 0
				and round.published IS NOT NULL
				and round.published > 0
				and event.type != 'attendee'

			order by event.type,
				event.level,
				event.abbr,
				round.name DESC
		`, {
			replacements: { tournId: req.params.tournId },
			type: db.Sequelize.QueryTypes.SELECT,
		});

		const rounds = rawRounds.map( (round) => {
			if (round.eventType === 'wsdc') {
				round.eventType = 'debate';
			}
			return round;
		});

		return res.status(200).json(rounds);
	},
};

export const getTournSchedule = {

	GET: async (req, res) => {

		const schedule = await req.db.sequelize.query(`
			select
				round.id, round.name, round.label, round.type, round.start_time startTime,
				event.id eventId, event.abbr eventAbbr,
				round.published,
				timeslot.id timeslotId, timeslot.start timeslotStart
			from (round, event, timeslot)
			where 1=1
				and event.tourn = :tournId
				and event.id = round.event
				and round.timeslot = timeslot.id
				and event.type != 'attendee'
			order by event.abbr, round.name, timeslot.start
		`, {
			replacements: { tournId: req.params.tournId },
			type: req.db.Sequelize.QueryTypes.SELECT,
		});

		return res.status(200).json(schedule);
	},
};

getTournPublishedRounds.GET.apiDoc = {
	summary     : 'Returns an array of published rounds for a tournament',
	operationId : 'getTournPublishedRounds',
	parameters  : [
		{
			in          : 'path',
			name        : 'tournId',
			description : 'Tournament ID to return rounds from',
			required    : false,
			schema      : { type: 'string', minimum: 1 },
		},
	],
	responses: {
		200: {
			description: 'Array of rounds which are published in any way',
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
	tags: ['invite', 'public', 'rounds'],
};

export const getTournPublishedResults = {
	GET: async (req, res) => {
		const db = req.db;
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

		const db = req.db;

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

		const db = req.db;

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
