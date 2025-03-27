export const getPersonHistory = {
	GET: async (req, res) => {

		const db = req.db;
		let person = {};

		try {

			const persons = await db.sequelize.query(`
				SELECT DISTINCT P.id FROM person P
				LEFT JOIN student S ON S.person = P.id
				WHERE
					P.nsda = :nsdaId
					OR S.nsda = :nsdaId
			`, {
				replacements : { nsdaId: req.query.nsda_id },
				type         : db.Sequelize.QueryTypes.SELECT,
			});

			person = persons[0];

		} catch (err) {
			console.log(`Error condition on person query`);
			console.log(err);
		}

		if (!person?.id) {
			return res.status(400).json({ message: 'Person not found' });
		}

		const replacements = {
			nsdaId   : req.query.nsda_id,
			personId : person.id,
		};

		const students = await db.sequelize.query(`
			SELECT
				T.name AS 'tournament',
				T.state as 'state',
				T.start AS 'start',
				T.end AS 'end',
				C.name AS 'chapter',
				EV.name AS 'event'
			FROM tourn T
				INNER JOIN school S ON S.tourn = T.id
				INNER JOIN entry E ON E.school = S.id
				INNER JOIN event EV ON EV.id = E.event
				INNER JOIN entry_student ES ON ES.entry = E.id
				INNER JOIN student ST ON ST.id = ES.student
				INNER JOIN chapter C ON C.id = ST.chapter
			WHERE (ST.nsda = :nsdaId OR ST.person = :personId)
				AND T.hidden = 0
			GROUP BY E.id
		`, {
			replacements,
			type : db.Sequelize.QueryTypes.SELECT,
		});

		const judges = await db.sequelize.query(`
			SELECT
				T.name AS 'tournament',
				T.state as 'state',
				T.start AS 'start',
				T.end AS 'end',
				S.name AS 'chapter',
				CAT.name AS 'category',
				COUNT(DISTINCT panel.id) as 'rounds_judged'
			FROM (tourn T, person P, judge J, category CAT)
				LEFT JOIN school S on J.school = S.id
				LEFT JOIN chapter C on C.id = S.chapter
				LEFT JOIN ballot on ballot.judge = J.id
				LEFT JOIN panel on panel.id = ballot.panel
			WHERE P.nsda = :nsdaId
				and P.id = J.person
				and J.category = CAT.id
				and CAT.tourn = T.id
				AND T.hidden = 0
			GROUP BY J.id
		`, {
			replacements,
			type : db.Sequelize.QueryTypes.SELECT,
		});

		const quizzes = await db.sequelize.query(`
			SELECT
				Q.label as 'quiz',
				PQ.pending AS 'pending',
				PQ.completed AS 'completed',
				PQ.timestamp AS 'timestamp'
			FROM person_quiz PQ
			INNER JOIN quiz Q ON Q.id = PQ.quiz
			WHERE PQ.person = :personId
		`, {
			replacements,
			type : db.Sequelize.QueryTypes.SELECT,
		});

		const history = {
			personId : person.id,
			student  : students,
			judge    : judges,
			quizzes,
		};

		return res.status(200).json(history);
	},
};

getPersonHistory.GET.apiDoc = {
	summary: 'Load history for a NSDA membership ID',
	operationId: 'getPersonHistory',
	parameters: [
		{
			in          : 'query',
			name        : 'nsda_id',
			description : 'NSDA Membership ID of person whose history you wish to access',
			required    : true,
			schema      : {
				type    : 'integer',
				minimum : 1,
			},
		},
	],
	responses: {
		200: {
			description: 'Person History',
			content: {
				'*/*': { schema: { type: 'object' } },
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['nsda'],
};

export default getPersonHistory;
