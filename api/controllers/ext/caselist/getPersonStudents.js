const getPersonStudents = {
	GET: async (req, res) => {
		const db = req.db;

		// Get all students on the same roster as the person,
		// but limit to students with future entries with a chapter with future tourns
		// to limit out camp and observer-only chapters
		const students = await db.sequelize.query(`
            SELECT
                DISTINCT S.id,
                S.first,
                S.last,
                CONCAT(S.first, ' ', S.last) AS 'name'
            FROM student S
			INNER JOIN chapter C ON C.id = S.chapter
            INNER JOIN entry_student ES ON ES.student = S.id
            INNER JOIN entry E ON E.id = ES.entry
            INNER JOIN tourn T ON T.id = E.tourn
			WHERE
				C.id IN (
					SELECT DISTINCT chapter FROM student S2 WHERE S2.retired = 0 AND S2.person = ?
					UNION ALL SELECT DISTINCT chapter FROM chapter_judge CJ WHERE CJ.retired = 0 AND CJ.person = ?
					GROUP BY chapter
				)
                AND S.retired = 0
                AND T.hidden <> 1
                AND T.start >= CURRENT_TIMESTAMP
            GROUP BY S.last, S.first
            ORDER BY S.last, S.first
        `, { replacements: [req.query.person_id] });

		return res.status(200).json([...students[0]]);
	},
};

getPersonStudents.GET.apiDoc = {
	summary: 'Load students for a person ID',
	operationId: 'getPersonStudents',
	parameters: [
		{
			in          : 'query',
			name        : 'person_id',
			description : 'ID of person whose students you wish to access',
			required    : true,
			schema      : {
				type    : 'integer',
				minimum : 1,
			},
		},
	],
	responses: {
		200: {
			description: 'Person Students',
			content: {
				'*/*': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/Student' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['caselist'],
};

export default getPersonStudents;
