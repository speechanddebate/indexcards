export const getInvite = {
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

			from (event, round)

				left join round_setting publish_entry_list
					on publish_entry_list.round = round.id
					and publish_entry_list.tag = 'publish_entry_list'

			where 1=1
				and event.tourn = :tournId
				and event.id = round.event
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

			from (person, permission)

			where 1=1
				and permission.tourn  = :tournId
				and permission.tag    = 'contact'
				and permission.person = person.id
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

export const getRounds = {
	GET: async (req, res) => {
		const db = req.db;

		let schemat = {};

		if (parseInt(req.params.roundId)) {

			schemat = await db.round.findByPk(
				parseInt(req.params.roundId), {
					include: [
						{ model: db.roundSetting, as: 'Settings' },
						{ model: db.panel, as: 'Panels' },
					],
				});

			if (schemat && schemat.published === 0) {
				schemat = { message: 'Round is not published' };
			}

			if (schemat == null) {
				schemat = { message: 'Round is not published' };
			}
		}

		return res.status(200).json(schemat);
	},
};

export const getPages = {
	GET: async (req, res) => {
		const db = req.db;
		const pages = await db.sequelize.query(`
			select
				id, title, slug, content, published, sitewide, special, page_order, parent, sidebar
			from (webpage page, tourn)
			where 1=1
				and page.published = 1
				and page.tourn = tourn.id
				and tourn.id = :tournId
				and tourn.hidden = 0
		`, {
			replacements : { tournId: req.params.tournId },
			type         : db.sequelize.QueryTypes.SELECT,
		});
		res.status(200).json(pages);
	},
};

export const getFiles = {
	GET: async (req, res) => {
		const db = req.db;
		const files = await db.sequelize.query(`
			select
				id, tag, type, label, filename, published, coach, page_order,
				parent, webpage, timestamp
			from (file, tourn)
			where 1=1
				and file.published = 1
				and file.tourn = tourn.id
				and tourn.id = :tournId
				and tourn.hidden = 0
		`, {
			replacements : { tournId: req.params.tournId },
			type         : db.sequelize.QueryTypes.SELECT,
		});
		res.status(200).json(files);
	},
};

export const getEvents = {
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

getInvite.GET.apiDoc = {

	summary     : 'Returns the public pages for a tournament',
	operationId : 'getInvite',
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
