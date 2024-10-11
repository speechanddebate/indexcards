export const getInvite = {
	GET: async (req, res) => {

		const db = req.db;
		const invite = {};

		if (req.params.tourn_id) {
			const result = await db.tourn.findByPk(parseInt(req.params.tourn_id));
			invite.tourn = result.get({ plain: true });

		} else if (req.params.webname) {

			const result = await db.tourn.findOne({
				where : { webname: req.params.webname },
				order : [['start', 'desc']],
				limit : 1,
			});

			invite.tourn = result.get({ plain: true });
		}

		// I included theses as "includes" from sequelize but the sql it
		// generated was amazingly inefficient and did not deliver the proper
		// tourn when asked by webname.

		if (invite.tourn?.id) {

			invite.tourn.webpages = await db.webpage.findAll({
				where: {
					tourn     : invite.tourn.id,
					published : 1,
				},
				raw: true,
				order: ['page_order'],
			});

			invite.tourn.files = await db.file.findAll({
				where: {
					tourn     : invite.tourn.id,
					published : 1,
				},
				raw: true,
				order: ['tag', 'label'],
			});

			const rawEvents = await db.event.findAll({
				where: {
					tourn : invite.tourn.id,
				},
				include: ['Settings'],
				order: ['type', 'abbr'],
			});

			invite.tourn.events = [];
			const settingsFilter = ['dumb_half_async_thing', 'no_autopair', 'honors_weight'];

			for (const rawEvent of rawEvents) {

				const event = rawEvent.get({ plain: true });
				event.settings = {};

				for ( const setting of event.Settings ) {

					if (settingsFilter.includes(setting.tag)) {
						console.log(`nope`);
					} else {
						if (setting.value === 'date') {
							event.settings[setting.tag] = new Date(setting.value_date);
						} else if (setting.value === 'json' && setting.value_text) {
							event.settings[setting.tag] = JSON.parse(setting.value_text);
						} else if (setting.value === 'text') {
							event.settings[setting.tag] = setting.value_text;
						} else {
							event.settings[setting.tag] = setting.value;
						}
					}

				}

				delete event.Settings;
				invite.tourn.events.push(event);
			}
		}

		return res.status(200).json(invite);
	},
};

export const getRounds = {
	GET: async (req, res) => {
		const db = req.db;

		let schemat = {};

		if (parseInt(req.params.round_id)) {

			schemat = await db.round.findByPk(
				parseInt(req.params.round_id), {
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

getInvite.GET.apiDoc = {

	summary     : 'Returns the public pages for a tournament',
	operationId : 'getInvite',
	parameters  : [
		{
			in          : 'path',
			name        : 'webname',
			description : 'Public webname of the tournament to return',
			required    : false,
			schema      : { type: 'string', minimum: 1 },
		},
		{
			in          : 'path',
			name        : 'tourn_id',
			description : 'Tournament ID of tournament to return',
			required    : false,
			schema      : { type: 'integer', minimum: 1 },
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
