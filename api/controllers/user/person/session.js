export const getSession = {

	GET: async (req, res) => {
		if (!req.session) {
			return res.status(201).json({ error: true, message: 'You have no active user session' });
		}
		return res.status(200).json(req.session);
	},

	POST: async (req, res) => {

		const db = req.db;
		const sessionKey = req.body?.sessionKey;

		const rawSession = await db.sequelize.query(`
			select
				session.id, session.defaults, session.push_notify,
				session.last_access,
				session.su,
				person.id person,
				person.first person_first, person.middle person_middle, person.last person_last,
				person.email, person.site_admin, person.nsda,
				person.accesses, person.no_email
			from person, session
			where session.userkey = :sessionKey
				and session.person = person.id
		`, {
			replacements: { sessionKey },
			type: db.Sequelize.QueryTypes.SELECT,
		});

		if (rawSession.length) {

			const local = rawSession[0];

			const session = {
				person : {
					first     : local.person_first,
					middle    : local.person_middle,
					last      : local.person_last,
					email     : local.email,
					noEmail   : local.no_email,
					siteAdmin : local.site_admin,
					nsda      : local.nsda,
					accesses  : local.accesses,
				},
				...local,
			};

			delete session.person_first;
			delete session.person_middle;
			delete session.person_last;
			delete session.email;
			delete session.no_email;
			delete session.site_admin;
			delete session.nsda;
			delete session.accesses;

			console.log(session);

			return res.status(200).json(session);
		}

		return res.status(401).json({ error: true,message: 'No active session found' });
	},
};

getSession.GET.apiDoc = {
	summary: 'Load the curent active session of the logged in user',
	operationId: 'getSession',
	responses: {
		200: {
			description: 'Session Profile',
			content: {
				'*/*': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/Session' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['accounts', 'session'],
};

getSession.POST.apiDoc = {
	summary: 'Given a Session Key delivers the corresponding session and personal data',
	operationId: 'findSession',
	requestBody: {
		required: true,
		content: {
			'application/json': {
				schema: {
					type        : 'object',
					description : 'Object with request key',
					properties : {
						sessionKey : { type : 'string', nullable : false },
					},
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Session',
			content: { 'application/json': { schema: { $ref: '#/components/schemas/Session' } } },
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['accounts', 'sessions'],
};

export default getSession;
