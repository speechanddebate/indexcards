import db from '../../../data/db.js';

// The purpose of this function is to deliver a complete list of "things I care
// about" at a tournament. That will help sorting the relevant judges, entries,
// events, etc to the top of the stack when displaying information.

export const getPersonTournPresence = {

	GET: async (req, res) => {

		const tournPresence = {
			judges     : {},
			schools    : {},
			entries    : {},
			events     : {},
			categories : {},
		};

		tournPresence.entries = await getPersonTournEntries(req.session.person , req.params.tournId);
		tournPresence.judges  = await getPersonTournJudges(req.session.person   , req.params.tournId);
		tournPresence.schools = await getPersonTournSchools(req.session.person  , req.params.tournId);

		for (const entryId in tournPresence.entries) {
			const entry = tournPresence.entries[entryId];

			if (!tournPresence.schools[entry.schoolId]) {
				tournPresence.schools[entry.schoolId] = {
					name : entry.schoolName,
					code : entry.schoolCode,
				};
			}

			tournPresence.events[entry.eventsId]  = true;
		}

		for (const judgeId in tournPresence.judges) {
			const judge = tournPresence.judges[judgeId];

			if (!tournPresence.schools[judge.schoolId]) {
				tournPresence.schools[judge.schoolId] = {
					name : judge.schoolName,
					code : judge.schoolCode,
				};
			}
			judge.events?.split(',').forEach( (event) => {
				tournPresence.events[event]  = true;

			});
			tournPresence.categories[judge.categoryId]  = true;
		}

		for (const schoolId in tournPresence.schools) {

			const school = tournPresence.schools[schoolId];

			school.entries?.split(',').forEach(entry => {
				if (!tournPresence.entries[entry]) {
					tournPresence.entries[entry] = true;
				}
			});

			school.judges?.split(',').forEach(judge => {
				if (!tournPresence.judges[judge]) {
					tournPresence.judges[judge] = true;
				}
			});

			school.events?.split(',').forEach (event => {
				tournPresence.events[event] = true;
			});

			school.categories?.split(',').forEach(category => {
				tournPresence.categories[category] = true;
			});
		}

		return res.status(200).json(tournPresence);
	},
};

getPersonTournPresence.GET.apiDoc = {
	summary     : 'Lists all the entries, judges, events, categories, and schools a Tabroom account cares about at a tournament',
	operationId : 'getPersonTournPresence',
	parameters  : [
		{
			in          : 'path',
			name        : 'tournId',
			description : 'ID of tournament so targeted.',
			required    : true,
			schema      : {
				type    : 'integer',
				minimum : 1,
			},
		},
	],
	responses: {
		200: {
			description: 'Object of objects of the relevant data types',
			content: {
				'*/*': {
					schema: {
						type: 'object',
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

export const getPersonTournEntries = async (personId, tournId) => {

	const entryArray = await db.sequelize.query(`
		select
			entry.id, entry.code, entry.name,
			student.id studentId, student.first, student.last,
			event.id eventId, event.abbr eventAbbr, event.name eventName, event.type eventType,
			school.id schoolId, school.name schoolName, school.code schoolCode
		from (event, entry, entry_student es, student)
			left join school on school.id = entry.school
		where 1=1
			and event.tourn = :tournId
			and event.type != 'attendee'
			and event.id = entry.event
			and entry.active = 1
			and entry.id = es.entry
			and es.student = student.id
			and student.person = :personId
		group by entry.id
	`, {
		replacements : { personId, tournId },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	return entryArray.reduce( (obj, item) => Object.assign(obj, { [item.id]: item }), {});
};

export const getPersonTournJudges = async (personId, tournId) => {

	const judgeArray = await db.sequelize.query(`
		select
			judge.id, judge.first, judge.last, judge.code,
			category.id categoryId, category.abbr categoryAbbr, category.name categoryName,
			GROUP_CONCAT(event.id) as events,
			school.id schoolId, school.name schoolName, school.code schoolCode
		from (judge, category)
			left join event on event.category = category.id
			left join school on school.id = judge.school
		where 1=1
			and judge.person   = :personId
			and judge.category = category.id
			and category.tourn = :tournId
		group by judge.id
	`, {
		replacements : { personId, tournId },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	return judgeArray.reduce( (obj, item) => Object.assign(obj, { [item.id]: item }), {});
};

export const getPersonTournSchools = async (personId, tournId) => {
	const schoolArray = await db.sequelize.query(`
		select
			school.id, school.code, school.name,
			GROUP_CONCAT(entry.id) as entries,
			GROUP_CONCAT(event.id) as events,
			GROUP_CONCAT(category.id) as categories,
			GROUP_CONCAT(judge.id) as judges
		from (school, contact)
			left join entry on entry.school = school.id and entry.active = 1
			left join judge on judge.school = school.id and judge.active = 1
			left join category on judge.category = category.id
			left join event on entry.event = event.id
		where 1=1
			and contact.person   = :personId
			and contact.school   = school.id
			and contact.official = 1
			and school.tourn     = :tournId
		group by school.id
	`, {
		replacements : { personId, tournId },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	return schoolArray.reduce( (obj, item) => Object.assign(obj, { [item.id]: item }), {});
};
