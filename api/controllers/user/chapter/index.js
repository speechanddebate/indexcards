export async function userChapters(req,res) {
	const chapters = await req.db.sequelize.query(`
		select
			chapter.*,
			permission.tag permission
		from (permission, chapter)
		where 1=1
			and permission.person = :personId
			and permission.chapter = chapter.id
		group by chapter.id
	`, {
		replacements: { personId: req.session.person },
		type: req.db.Sequelize.QueryTypes.SELECT,
	});

	return res.status(200).json(chapters);
};

export async function userChaptersByTourn(req, res)  {
	const chapters = await req.db.sequelize.query(`
			select
				chapter.*,
				permission.tag permission,
				school.id schoolId, school.tourn tournId,
				school.code schoolCode, school.onsite
			from (permission, chapter)
				left join school
					on school.chapter = chapter.id
					and school.tourn = :tournId
			where 1=1
				and permission.person = :personId
				and permission.chapter = chapter.id
			group by chapter.id
		`, {
		replacements : {
			personId : req.session.person,
			tournId  : req.params.tournId,
		},
		type: req.db.Sequelize.QueryTypes.SELECT,
	});

	const chapterIds = chapters.map( (chapter) => chapter.id );

	if (chapterIds.length < 1) {
		// Avoids null error below. There is no chapter 1.
		chapterIds.push(1);
	}

	const dashboards = await req.db.sequelize.query(`
			select
				chapter.*,
				school.id schoolId, school.tourn tournId,
				school.code schoolCode, school.onsite,
				'dashboard' as permission
			from (contact, school, chapter)
				where 1 = 1
				and contact.person   = :personId
				and contact.school   = school.id
				and school.tourn     = :tournId
				and contact.official = 1
				and school.chapter   = chapter.id
				and chapter.id NOT IN ( :chapterIds )
				group by chapter.id
		`, {
		replacements: {
			personId   : req.session.person,
			tournId    : req.params.tournId,
			chapterIds,
		},
		type: req.db.Sequelize.QueryTypes.SELECT,
	});

	chapters.push(...dashboards);

	const schoolIds = chapters.map( (chapter) => chapter.schoolId );

	const events = await req.db.sequelize.query(`
			select
				event.id, event.type, event.name, event.abbr
			from event, entry
			where 1=1
				and event.tourn = :tournId
				and event.id = entry.event
				and entry.active = 1
				and entry.school IN ( :schoolIds )
			order by event.type, event.abbr
		`, {
		replacements : {schoolIds, tournId: req.params.tournId },
		type: req.db.Sequelize.QueryTypes.SELECT,
	});

	return res.status(200).json({
		chapters,
		events,
	});
};

export default userChapters;

userChapters.openapi = {
	summary: 'List the chapters and permissions level given a person ID',
	operationId: 'userChapters',
	responses: {
		200: {
			description: 'Chapter',
			content: {
				'*/*': {
					schema: {
						type: 'string',
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

userChaptersByTourn.openapi = {
	summary: 'List the chapters and permissions level given a person ID',
	operationId: 'userChaptersByTourn',
	parameters: [
		{
			in          : 'path',
			name        : 'tournId',
			description : 'ID of tournament to pull parallel school registration information from.',
			required    : true,
			schema      : {
				type    : 'integer',
				minimum : 1,
			},
		},
	],
	responses: {
		200: {
			description: 'Chapter with School Metadata',
			content: {
				'*/*': {
					schema: {
						type: 'string',
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};