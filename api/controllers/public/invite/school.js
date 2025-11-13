// Functions that deliver information about the schools a user's chapter may be
// registered into for the public facing sides of Tabroom when a login session
// is present.

export const getMyChaptersNonTourn = {
	GET: async (req, res) => {

		if (!req.session) {
			res.status(201).json([]);
		}

		const tournChapters = await req.db.sequelize.query(`
			select
				chapter.id, chapter.name
			from (chapter, permission)
			where 1=1
				and permission.person = :personId
				and permission.chapter = chapter.id
				and permission.tag = 'chapter'
				and NOT EXISTS (
					select school.id
						from school
					where 1=1
						and school.chapter = chapter.id
						and school.tourn = :tournId
				)
			order by chapter.name
		`, {
			replacements: {
				personId: req.session.person,
				tournId: req.params.tournId,
			},
			type: req.db.Sequelize.QueryTypes.SELECT,
		});

		return res.status(200).json(tournChapters);
	},
};

export const getMySchoolsByTourn = {

	GET: async (req, res) => {

		if (!req.session) {
			res.status(201).json([]);
		}

		const tournSchools = await req.db.sequelize.query(`
			select
				school.id, school.name, school.code,
				school.onsite, school.chapter
			from (school)
			where 1=1
				and school.tourn = :tournId
				and (
					EXISTS (
						select perm.id
							from (permission perm, chapter)
						where 1=1
							and perm.person = :personId
							and perm.chapter = chapter.id
							and perm.tag = 'chapter'
							and chapter.id = school.chapter
					) OR EXISTS (
					 	select contact.id
							from contact
						where 1=1
							and contact.school = school.id
							and contact.person = :personId
							and (contact.official = 1 OR contact.onsite = 1)
					)
				)
			group by school.id
			order by school.name
			limit 5
		`, {
			replacements : {
				personId: req.session.person,
				tournId: req.params.tournId,
			},
			type: req.db.Sequelize.QueryTypes.SELECT,
		});

		const schoolIds = tournSchools.map( (school) => school.id );
		const chapterIds = tournSchools.map( (school) => school.chapter );

		if (schoolIds.length > 0) {

			// Discover roster by student and chapter to account for hybrid
			// entries

			const tournStudents = await req.db.sequelize.query(`
				select
					student.id, student.first, student.middle, student.last,
					entry.code, student.chapter, entry.event eventId
				from (student, entry_student es, entry, school)
				where 1=1
					and school.tourn = :tournId
					and school.id = entry.school
					and entry.active = 1
					and entry.id = es.entry
					and es.student = student.id
					and student.chapter IN (:chapterIds)
				group by student.id
				order by student.last
			`, {
				replacements: {
					chapterIds,
					tournId: req.params.tournId,
				},
				type: req.db.Sequelize.QueryTypes.SELECT,
			});

			const tournJudges = await req.db.sequelize.query(`
				select
					judge.id, judge.first, judge.last, judge.school
				from judge
				where 1=1
					and judge.school IN (:schoolIds)
			`, {
				replacements: {
					schoolIds,
				},
				type: req.db.Sequelize.QueryTypes.SELECT,
			});

			const tournEntries = await req.db.sequelize.query(`
				select
					entry.school, entry.id, entry.name, entry.code,
					event.id eventId, event.name eventName, event.abbr eventAbbr
					from (entry, event)
				where 1=1
					and entry.school IN (:schoolIds)
					and entry.active = 1
					and entry.event = event.id
			`, {
				replacements: { schoolIds },
				type: req.db.Sequelize.QueryTypes.SELECT,
			});

			// This seems inefficient but the vast majority of cases involve just
			// one school and one entry and for those weird edges it's usually a
			// league admin thus the limit 5 in the query above.

			for (const school of tournSchools) {

				const entries = tournEntries.filter( entry => entry.school === school.id );
				const judges = tournJudges.filter( judge => judge.school === school.id );
				school.students = tournStudents.filter( student => student.chapter === school.chapter);

				school.entries = {};
				school.events = {};
				school.judges = {};

				for (const judge of judges) {
					delete judge.school;
					school.judges[judge.id] = { ...judge};
				}

				for (const entry of entries) {
					if (!school.events[entry.eventId]) {
						school.events[entry.eventId] = {
							name: entry.eventName,
							abbr: entry.eventAbbr,
						};
					}
					school.entries[entry.id] = {
						code      : entry.code,
						name      : entry.name,
						eventId   : entry.eventId,
						eventAbbr : entry.eventAbbr,
					};
				}
			}
		}

		return res.status(200).json(tournSchools);
	},
};

getMySchoolsByTourn.GET.apiDoc = {

	summary     : 'Returns the schools with entries and events you can access for a tournament',
	operationId : 'getMySchoolsByTourn',
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
			description: 'Listing of schools with events and entry IDs to highlight',
			content: { '*/*': { schema: { $ref: '#/components/schemas/Invite' } } },
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['invite', 'schools', 'entries', 'events'],
};