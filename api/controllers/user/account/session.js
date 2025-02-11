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

		const session = await db.sequelize.query(`
			select
				session.id, session.defaults, session.push_notify,
				session.last_access,
				session.su,
				person.id person,
				person.first personFirst, person.middle personMiddle, person.last personLast,
				person.email, person.site_admin, person.nsda

			from person, session
			where session.userkey = :sessionKey
				and session.person = person.id
		`, {
			replacements: { sessionKey },
			type: db.Sequelize.QueryTypes.SELECT,
		});

		if (session.length) {
			return res.status(200).json(session[0]);
		}

		return res.status(401).json({ error: true, message: 'No active session found' });
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
