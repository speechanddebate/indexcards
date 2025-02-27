import { b64_sha512crypt as crypt } from 'sha512crypt-node';

// This name is currently a misnomer, because this doesn't actually create a session, it just validates the username and password
// Eventually, this should be expanded to create a session and return it
const login = {
	POST: async (req, res) => {
		const db = req.db;

		if (!req.body?.username) {
			return res.status(400).json({ error: 'No username sent' });
		}

		const person = await db.person.findOne({
			where: { email: req.body.username },
			include : [
				{ model: db.personSetting, as: 'Settings' },
			],
		});

		if (!person || typeof person !== 'object' || !person.id || !person.password) {
			return res.status(400).json({ error: 'No user found for username' });
		}

		if (!req.body?.password) {
			return res.status(400).json({ error: 'No password sent' });
		}

		const hash = crypt(req.body.password, person.password);

		if (hash !== person.password) {
			return res.status(400).json({ error: 'Incorrect password' });
		}

		// Check account reputation - default to untrusted
		const response = {
			person_id : person.id,
			first     : person.first,
			last      : person.last,
			name      : `${person.first} ${person.last}`,
			email     : req.body.username,
			phone     : person.phone,
			pronoun   : person.pronoun,
			trusted   : false,
		};

		// Check if the account is banned, bail early if so
		const isBannedQuery = await db.sequelize.query(`
			SELECT COUNT(*) AS 'count'
				FROM person_setting PS
			WHERE PS.person = :personId
				AND PS.tag = 'banned'
				AND PS.value = 1
		`, {
			replacements: { personId: person.id },
			type: db.sequelize.QueryTypes.SELECT,
		});

		if (!isBannedQuery
			|| isBannedQuery.length === 0
			|| isBannedQuery[0].count > 0
		) {
			return res.status(200).json(response);
		}

		// On a student roster for a school with at least one tournament entry at a real tourn
		const onStudentRoster = await db.sequelize.query(`
			SELECT COUNT(*) AS 'count'
			FROM student S
			INNER JOIN chapter C ON C.id = S.chapter
			INNER JOIN school SC ON SC.chapter = C.id
			INNER JOIN tourn T ON T.id = SC.tourn
			INNER JOIN result_set RS ON RS.tourn = T.id
			WHERE
				S.person = :personId
				AND T.hidden = 0
			GROUP BY S.person
		`, { replacements: { personId: person.id },
			type: db.sequelize.QueryTypes.SELECT,
		});

		if (onStudentRoster.length > 0
			&& onStudentRoster[0].count > 0
		) {
			response.trusted = true;
			return res.status(200).json(response);
		}

		// On a judge roster for a school with at least one tournament entry at a real tourn
		const onJudgeRoster = await db.sequelize.query(`
			SELECT COUNT(*) AS 'count'
			FROM chapter_judge CJ
			INNER JOIN chapter C ON C.id = CJ.chapter
			INNER JOIN school SC ON SC.chapter = C.id
			INNER JOIN tourn T ON T.id = SC.tourn
			INNER JOIN result_set RS ON RS.tourn = T.id
			WHERE
				CJ.person = :personId
				AND T.hidden = 0
			GROUP BY CJ.person
		`, { replacements: { personId: person.id },
			type: db.sequelize.QueryTypes.SELECT,
		});

		if (onJudgeRoster.length > 0
			&& onJudgeRoster[0].count > 0
		) {
			response.trusted = true;
			return res.status(200).json(response);
		}

		// Is a coach for a school with at least one tournament entry at a real tourn
		const isCoach = await db.sequelize.query(`
			SELECT COUNT(*) AS 'count'
			FROM permission P
			INNER JOIN chapter C ON C.id = P.chapter
			INNER JOIN school SC ON SC.chapter = C.id
			INNER JOIN tourn T ON T.id = SC.tourn
			INNER JOIN result_set RS ON RS.tourn = T.id
			WHERE P.person = :personId
				AND P.tag = 'chapter'
				AND T.hidden = 0
			GROUP BY P.person
		`, { replacements: { personId: person.id },
			type: db.sequelize.QueryTypes.SELECT,
		});

		if (isCoach.length > 0
			&& isCoach[0].count > 0
		) {
			response.trusted = true;
			return res.status(200).json(response);
		}

		return res.status(200).json(response);
	},
};

login.POST.apiDoc = {
	summary: 'Logs in and returns a session object',
	operationId: 'login',
	requestBody: {
		description: 'The username and password to login',
		required: true,
		content: { '*/*': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
	},
	responses: {
		200: {
			description: 'Session',
			content: { '*/*': { schema: { $ref: '#/components/schemas/Session' } } },
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['accounts'],
};

export default login;
