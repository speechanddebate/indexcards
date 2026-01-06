import { startOfYear } from '@speechanddebate/nsda-js-utils';
import { BadRequest, NotFound } from '../../helpers/problem.js';
import db from '../../data/db.js';

export async function getPersonChapters(req, res) {
	const student = await db.sequelize.query(`
        SELECT DISTINCT C.id, C.name, C.state
        FROM chapter C
        INNER JOIN student S ON S.chapter = C.id
        WHERE S.person = ?
    `, { replacements: [req.query.person_id] });
	const advisor = await db.sequelize.query(`
        SELECT DISTINCT C.id, C.name, C.state
        FROM chapter C
        INNER JOIN permission P ON P.chapter = C.id AND tag = 'chapter'
        WHERE P.person = ?
    `, { replacements: [req.query.person_id] });

	return res.status(200).json([...student[0], ...advisor[0]]);
};
getPersonChapters.openapi = {
	summary: 'Load chapters for a person ID',
	security: [{ extApiKey: [] }],
	tags: ['Ext : Caselist'],
	parameters: [
		{
			in          : 'query',
			name        : 'person_id',
			description : 'ID of person whose chapters you wish to access',
			required    : true,
			schema      : {
				type    : 'integer',
				minimum : 1,
			},
		},
	],
	responses: {
		200: {
			description: 'Person Chapters',
			content: {
				'*/*': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/Chapter' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};
export async function getPersonRounds(req, res) {
	if (!req.query.person_id && !req.query.slug) {
		return BadRequest(req, res, 'One of person_id or slug is required');
	}

	let ids;

	// If person_id is provided, look up that person's rounds
	// The ID is provided by the caselist after authentication, so this only allows a user to
	// look up their own rounds, not an arbitrary person_id
	if (req.query.person_id) {
		ids = [req.query.person_id];
	} else {
		// If no person_id provided, look up any linked person_id's based on the slug
		// This allows looking up other people's rounds if they've opted in to linking themselves to a page
		const persons = await db.sequelize.query(`
            SELECT DISTINCT C.person
            FROM caselist C
            WHERE slug = ?
        `, { replacements: [req.query.slug] });

		if (!persons || persons[0].length < 1 || !persons[0][0].person) {
			return NotFound(req, res, 'No caselist links found');
		}
		ids = persons[0].map(p => p.person);
	}

	let sql = `
        SELECT
            DISTINCT P.id,
            T.name AS 'tournament',
            COALESCE(NULLIF(R.label, ''), NULLIF(R.name, ''), NULLIF(R.type, ''), 'X') AS 'round',
            CASE WHEN B.side = 1 THEN 'A' ELSE 'N' END AS 'side',
            O.code AS 'opponent',
            GROUP_CONCAT(DISTINCT J.last) AS 'judge',
            R.start_time AS 'start',
            CASE WHEN R.start_time > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY) THEN PS.value ELSE NULL END AS 'share'
        FROM
            panel P
            INNER JOIN ballot B ON B.panel = P.id
            INNER JOIN judge J ON J.id = B.judge
            INNER JOIN round R ON R.id = P.round
            INNER JOIN event E ON R.event = E.id
            INNER JOIN tourn T ON T.id = E.tourn
            INNER JOIN entry EN ON EN.id = B.entry
            INNER JOIN entry_student ES ON ES.entry = EN.id
            INNER JOIN student S ON S.id = ES.student
            INNER JOIN person PN ON PN.id = S.person

            INNER JOIN ballot OB ON OB.panel = P.id AND OB.id <> B.id
            INNER JOIN entry O ON O.id = OB.entry
            LEFT JOIN panel_setting PS ON PS.panel = P.id
                AND PS.tag = 'share'
        WHERE
            PN.id IN (?)
            AND R.published = 1
            AND E.type = 'debate'
            AND T.hidden <> 1
            AND T.start > '${startOfYear}-08-01 00:00:00'
            AND T.start < DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 HOUR)
    `;

	if (req.query.current) {
		sql += `
            AND R.start_time > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 6 HOUR)
        `;
	}

	sql += `
        GROUP BY P.id
        ORDER BY R.start_time DESC
    `;

	let rounds = await db.sequelize.query(sql, { replacements: [ids.toString()] });
	rounds = rounds[0].filter(r => r.id);
	rounds.forEach(r => {
		const numeric = parseInt(r.round?.replace(/[^\d]/g, '')?.trim()) || 0;
		if (numeric > 0 && numeric < 10) {
			r.round = numeric.toString();
		} else {
			if (r.round?.toLowerCase()?.includes('quad')) { r.round = 'Quads'; }
			if (r.round?.toLowerCase()?.includes('qd')) { r.round = 'Quads'; }
			if (r.round?.toLowerCase()?.includes('qd')) { r.round = 'Quads'; }
			if (r.round?.toLowerCase()?.includes('128')) { r.round = 'Quads'; }
			if (r.round?.toLowerCase()?.includes('tri')) { r.round = 'Triples'; }
			if (r.round?.toLowerCase()?.includes('trp')) { r.round = 'Triples'; }
			if (r.round?.toLowerCase()?.includes('64')) { r.round = 'Triples'; }
			if (r.round?.toLowerCase()?.includes('dou')) { r.round = 'Doubles'; }
			if (r.round?.toLowerCase()?.includes('dbl')) { r.round = 'Doubles'; }
			if (r.round?.toLowerCase()?.includes('32')) { r.round = 'Doubles'; }
			if (r.round?.toLowerCase()?.includes('oct')) { r.round = 'Octas'; }
			if (r.round?.toLowerCase()?.includes('16')) { r.round = 'Octas'; }
			if (r.round?.toLowerCase()?.includes('quar')) { r.round = 'Quarters'; }
			if (r.round?.toLowerCase()?.includes('qrt')) { r.round = 'Quarters'; }
			if (r.round?.toLowerCase()?.includes('sem')) { r.round = 'Semis'; }
			if (r.round?.toLowerCase()?.includes('fin')) { r.round = 'Finals'; }
		}
	});

	// Remove share link if looking up another person's rounds,
	// share links should only be accessible by the person themselves
	if (!req.query.person_id || req.query.slug) {
		rounds.forEach(r => {
			delete r.share;
		});
	}

	return res.status(200).json(rounds);
};
getPersonRounds.openapi = {
	summary: 'Load rounds for a person ID',
	security: [{ extApiKey: [] }],
	tags: ['Ext : Caselist'],
	parameters: [
		{
			in          : 'query',
			name        : 'person_id',
			description : 'Person ID to get rounds for',
			required    : false,
			schema      : {
				type    : 'integer',
			},
		},
		{
			in          : 'query',
			name        : 'slug',
			description : 'Slug of page to match rounds',
			required    : false,
			schema      : {
				type    : 'string',
			},
		},
		{
			in          : 'query',
			name        : 'current',
			description : 'Whether to return only current rounds',
			required    : false,
			schema      : {
				type    : 'boolean',
			},
		},
	],
	responses: {
		200: {
			description: 'Person Rounds',
			content: {
				'*/*': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/Round' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

export async function getPersonStudents(req, res) {
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
    `, { replacements: [req.query.person_id, req.query.person_id] });

	return res.status(200).json([...students[0]]);
};

getPersonStudents.openapi = {
	summary: 'Load students for a person ID',
	security: [{ extApiKey: [] }],
	tags: ['Ext : Caselist'],
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
};

export async function postCaselistLink(req, res) {
	await db.sequelize.query(`
        INSERT INTO caselist (slug, eventcode, person)
        VALUES (?, ?, ?)
    `, { replacements: [req.body.slug.trim(), parseInt(req.body.eventcode) || 0, req.body.person_id] });

	return res.status(201).json({ message: 'Successfully created caselist link' });
};
postCaselistLink.openapi = {
	summary: 'Create a link to a caselist page',
	security: [{ extApiKey: [] }],
	tags: ['Ext : Caselist'],
	requestBody: {
		description: 'The caselist link',
		required: true,
		content: { '*/*': { schema: { $ref: '#/components/schemas/CaselistLink' } } },
	},
	responses: {
		200: {
			description: 'Caselist Link',
			content: {
				'*/*': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/CaselistLink' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};