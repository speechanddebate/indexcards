import db from '../../../data/db.js';

// The purpose of this function is to deliver a complete list of "things I care
// about" at a tournament. That will help sorting the relevant judges, entries,
// events, etc to the top of the stack when displaying information.

// Refactored to simplify this down, mostly because the frontend for this area
// only really needs the base IDs for the entities in question and not
// additional metadata. -- CLP

export async function getPersonTournPresence(req, res) {

	const tournPresence = {
		me: {
			entries    : [],
			events     : [],
			judges     : [],
			categories : [],
		},
		mine: {
			entries    : [],
			events     : [],
			judges     : [],
			categories : [],
		},
	};

	const edata = await getPersonTournEntries(req.session.personId, req.params.tournId);
	const jdata = await getPersonTournJudges(req.session.personId, req.params.tournId);
	const sdata = await getPersonTournSchools(req.session.personId, req.params.tournId);

	// Unique lists of stuff that is me as an individual
	Object.keys(tournPresence.me).forEach( (key) => {
		console.log(`Tagging key ${key} with entry data ${edata[key]}`);
		tournPresence.me[key] =Array.from(new Set([
			...edata[key],
			...jdata[key],
		]));

		console.log(tournPresence.me);
	});

	// Unique lists of stuff that is mine as a coach
	Object.keys(tournPresence.mine).forEach( (key) => {
		tournPresence.mine[key] =Array.from(new Set([
			...sdata[key],
		]));
	});
	return res.status(200).json(tournPresence);
};

export const getPersonTournEntries = async (personId, tournId) => {

	const entryArray = await db.sequelize.query(`
		select
			entry.id, entry.event
		from (event, entry, entry_student es, student)
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

	const edata = {
		entries    : [],
		events     : [],
		judges     : [],
		categories : [],
	};

	edata.entries = entryArray.map( (entry) => entry.id );
	edata.events  = entryArray.map( (entry) => entry.event );
	return edata;
};

export const getPersonTournJudges = async (personId, tournId) => {

	const judgeArray = await db.sequelize.query(`
		select
			judge.id, judge.category, judge.alt_category altCategory,
			(
				select (GROUP_CONCAT(distinct round.event))
					from ballot, panel, round
				where ballot.judge = judge.id
					and ballot.panel = panel.id
					and panel.round = round.id
			) as events
		from (judge, category)
		where 1=1
			and judge.person   = :personId
			and judge.category = category.id
			and category.tourn = :tournId
		group by judge.id
	`, {
		replacements : { personId, tournId },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	const jdata = {
		judges     : [],
		categories : [],
		events     : [],
		entries    : [],
	};

	judgeArray.forEach( (judge) => {
		jdata.judges.push(judge.id);
		jdata.categories.push(judge.category);
		if (judge.altCategory) jdata.categories.push(judge.category);
		if (judge.events) jdata.events.push(judge.events.split(',').map(Number));
	});
	return jdata;
};

export const getPersonTournSchools = async (personId, tournId) => {
	const schoolArray = await db.sequelize.query(`
		select
			school.id,
			GROUP_CONCAT(entry.id) as entries,
			GROUP_CONCAT(event.id) as events,
			GROUP_CONCAT(category.id) as categories,
			GROUP_CONCAT(judge.id) as judges
		from (school)
			left join entry on entry.school = school.id and entry.active = 1
			left join judge on judge.school = school.id
			left join category on judge.category = category.id
			left join event on entry.event = event.id
		where 1=1
			and school.tourn = :tournId
			AND (
				EXISTS (
					select contact.id from contact
					where 1=1
						and contact.person   = :personId
						and contact.school   = school.id
						and (contact.official = 1 OR contact.onsite = 1)
				) OR EXISTS (
					select permission.id from permission
					where 1=1
						and permission.person = :personId
						and permission.chapter = school.chapter
						and permission.tag = 'chapter'
				)
			)
		group by school.id
	`, {
		replacements : { personId, tournId },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	const sdata = {
		schools    : [],
		entries    : [],
		judges     : [],
		categories : [],
		events     : [],
	};

	schoolArray.forEach( (school) => {
		sdata.schools.push(school.id);
		if (school.entries) sdata.entries.push(...school.entries.split(',').map(Number));
		if (school.judges) sdata.judges.push(...school.judges.split(',').map(Number));
		if (school.events) sdata.events.push(...school.events.split(',').map(Number));
		if (school.categories) sdata.categories.push(...school.categories.split(',').map(Number));
	});

	return sdata;
};
