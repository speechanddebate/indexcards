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
			return res.status(404).json({message: 'No such tournament found'});
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
				cap.value cap,
				school_cap.value schoolCap,
				topic.source topicSource, topic.event_type topicEventType, topic.tag topicTag,
				topic.topic_text topicText,
				field_report.value fieldReport,
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
		`, {
			replacements : { tournId: invite.tourn.id },
			type         : db.sequelize.QueryTypes.SELECT,
		});

		invite.rounds = await db.sequelize.query(`
			select
				round.id, round.label, round.name,
				event.id eventId, event.abbr eventAbbr, event.name eventName,
				publish_entry_list.value entryList

			from (event, round, tourn)

				left join round_setting publish_entry_list
					on publish_entry_list.round = round.id
					and publish_entry_list.tag = 'publish_entry_list'

			where 1=1
				and event.tourn = :tournId
				and event.id = round.event
				and tourn.id = event.tourn
				and tourn.hidden   = 0
				and (round.published > 0
					OR EXISTS
						(select rs.id
						from round_setting rs
						where rs.round = round.id
						and rs.tag = 'publish_entry_list'
					)
				)
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

export const getRound = {

	GET: async (req, res) => {

		const db = req.db;

		const roundData = await db.sequelize.query(`
			select
				round.id roundId, round.name roundName, round.label roundLabel, round.type roundType,
				round.published, round.post_primary, round.post_secondary, round.post_feedback,
				event.id eventId, event.name eventName, event.abbr eventAbbr, event.type eventType,
				online_mode.value online,
				field_report.value fieldReport,
				anonymous_public.value anonymousPublic,
				no_anon_dashboard.value noAnonymousDashboard,
				no_public_rooms.value noPublicRooms
			from (round, event)

				left join event_setting online_mode
					on online_mode.event = event.id
					and online_mode.tag  = 'online_mode'

				left join event_setting field_report
					on field_report.event = event.id
					and field_report.tag  = 'field_report'

				left join event_setting no_public_rooms
					on no_public_rooms.event = event.id
					and no_public_rooms.tag  = 'no_public_rooms'

				left join event_setting anonymous_public
					on anonymous_public.event = event.id
					and anonymous_public.tag  = 'anonymous_public'

				left join event_setting no_anon_dashboard
					on no_anon_dashboard.event = event.id
					and no_anon_dashboard.tag  = 'no_anon_dashboard'

			where 1=1
				and round.id = :roundId
				and round.event = event.id
				and round.published > 0
		`, {
			replacements : { roundId : req.params.roundId },
			type         : db.Sequelize.QueryTypes.SELECT,
		});

		if (roundData.length < 1) {
			return res.status(404).json({ message: `No round found with ID ${req.params.roundID}`});
		}

		const round = roundData[0];

		const translator = {
			0 : 'none',
			1 : 'full',
			2 : 'no_judges',
			3 : 'entry_list',
			5 : 'room_assignments',
		};

		if (!round.published) {
			round.published = 'none';
		} else if (translator[round.published]) {
			round.published = translator[round.published] || 'none';
		}

		const resultsTranslator = {
			0 : 'none',
			1 : 'coaches',
			2 : 'entries',
		};

		['post_primary', 'post_secondary', 'post_feedback'].forEach( (tag) => {
			if (!round[tag]) {
				round[tag] = 'none';
			} else if (resultsTranslator[round[tag]]) {
				round[tag] = resultsTranslator[round[tag]] || 'none';
			}
		});

		const schemats = await db.sequelize.query(`
			select
				panel.id panelId, panel.letter panelLetter, panel.flight, panel.bye,
				room.id roomId, room.name roomName,
				entry.id entryId, entry.code entryCode, entry.name entryName,
				ballot.side side, ballot.speakerorder speakerOrder,
				judge.id judgeId,
				judge.first judgeFirst, judge.last judgeLast, judge.middle judgeMiddle,
				judge.code judgeCode

			from (panel, ballot, entry)
				left join room on panel.room = room.id
				left join judge on ballot.judge = judge.id

			where 1=1
				and panel.round  = :roundId
				and panel.id     = ballot.panel
				and ballot.entry = entry.id

			group by ballot.id
			order by panel.flight, panel.letter
		`, {
			replacements : { roundId : round.roundId },
			type         : db.Sequelize.QueryTypes.SELECT,
		});

		if (round.anonymousPublic) {
			schemats.forEach( (section) => {
				delete section.entryName;
				delete section.entryId,
				delete section.judgeFirst;
				delete section.judgeMiddle;
				delete section.judgeLast;
				delete section.judgeId;

			});
		}

		if (round.noPublicRooms) {
			schemats.forEach( (section) => {
				delete section.roomId;
				delete section.roomName;
			});
		}

		return res.status(200).json(schemats);
	},
};

getRound.GET.apiDoc = {
	summary     : 'Returns an schematic of a requested round so long as it is public',
	operationId : 'getRound',
	parameters  : [
		{
			in          : 'path',
			name        : 'tournId',
			description : 'Tournament ID to return events for',
			required    : false,
			schema      : { type: 'number', minimum: 1 },
		}, {
			in          : 'path',
			name        : 'roundId',
			description : 'Round ID to return schematics for',
			required    : false,
			schema      : { type: 'number', minimum: 1 },
		},
	],
	responses: {
		200: {
			description: 'Array of panels with judges and students',
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
	tags: ['invite', 'public', 'schematics', 'rounds', 'pairings'],
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
		const rounds = await db.sequelize.query(`
			select
				round.id roundId, round.name roundName, round.label roundLabel, round.type roundType,
					round.published,
					round.post_primary roundPostPrimary,
					round.post_secondary roundPostSecondary,
					round.post_feedback roundPostFeedback,
				event.id eventId, event.name eventName, event.abbr eventAbbr, event.type eventType
			from (round, event, tourn)
			where 1=1
				and event.tourn = :tournId
				and event.id = round.event
				and round.published IS NOT NULL
				and round.published > 0
				and event.tourn = tourn.id
				and tourn.hidden   = 0
			order by event.type, event.abbr, round.name
		`, {
			replacements: { tournId: req.params.tournId },
			type: db.Sequelize.QueryTypes.SELECT,
		});

		return res.status(200).json(rounds);
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
				left join event on result_set.event = event.id
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
