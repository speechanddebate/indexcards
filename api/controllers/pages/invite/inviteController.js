import db from '../../../data/db.js';
import {
	convertTZ,
	shortZone,
	getWeek,
	isSameDay,
	showDateRange,
} from '../../../helpers/dateTime.js';
import { ucfirst } from '../../../helpers/text.js';

export async function getTournIdByWebname(req,res){

	const webname = req.params.webname.replace(/\W/g, '');
	const reply = {
		tournId   : 0,
		name      : '',
		start     : '',
		webname   : '',
		multiYear : false,
	};

	// Find the most recent tournament that answers to that name.

	const results = await db.sequelize.query(`
		select
			tourn.id, tourn.webname, tourn.name, tourn.start
		from tourn
		where 1=1
			and (tourn.webname = :webname OR tourn.id = :webname)
		ORDER BY tourn.start DESC
		LIMIT 1
	`, {
		replacements : {webname},
		type         : db.sequelize.QueryTypes.SELECT,
	});

	if (results.length > 0) {

		const tourn = results[0];

		// If I'm searching by ID number, find the webname
		if (tourn.webname !== webname) {
			const nameCheck = await db.sequelize.query(`
				select
					tourn.id, tourn.webname, tourn.name, tourn.start
				from tourn
				where 1=1
					and tourn.webname = :webname
				ORDER BY tourn.start DESC
				LIMIT 1
			`, {
				replacements: {webname: tourn.webname},
				type		 : db.sequelize.QueryTypes.SELECT,
			});

			if (nameCheck[0].id !== tourn.id) {
				// I am the current instance of webname
				reply.webname = tourn.webname;
				reply.tournId = tourn.id;
				reply.name    = tourn.name;
				reply.start   = tourn.start;
			} else {
				// I am not the current instance of webname, so all URLs must be ID encoded
				reply.webname = tourn.id.toString();
				reply.tournId = tourn.id;
				reply.name    = tourn.name;
				reply.start   = tourn.start;
			}

			if (nameCheck.length > 1) {
				reply.multiYear = true;
			}

		} else {
			// If I'm searching by webname, deliver the current ID number
			reply.webname = tourn.webname;
			reply.tournId = tourn.id;
			reply.name    = tourn.name;
			reply.start   = tourn.start;
			if (results.length > 1) {
				reply.multiYear = true;
			}
		}
	}

	return res.status(200).json(reply);
}

export async function getNSDAEventCategories(req, res) {
	const eventCodes = await db.sequelize.query(`
		select
			nsda.code, nsda.name
		from nsda_category nsda
			order by nsda.name
	`, {
		type : db.sequelize.QueryTypes.SELECT,
	});
	return res.status(200).json(eventCodes);
};

export async function getEventIdByWebname(req,res) {

	const webname = req.params.webname.replace(/\W/g, '');

	const reply = {
		tournId: 0,
		eventId: 0,
		webname: '',
		multiYear: false,
	};

	// Find the most recent tournament that answers to that name.
	const results = await db.sequelize.query(`
		select
			tourn.id, tourn.webname
		from tourn
		where 1=1
			and (tourn.webname = :webname OR tourn.id = :webname)
		ORDER BY tourn.start DESC
		LIMIT 1
	`, {
		replacements: {webname},
		type		 : db.sequelize.QueryTypes.SELECT,
	});

	if (results.length > 0) {

		const tourn = results[0];

		// If I'm searching by ID number, find the webname
		if (tourn.webname !== webname) {
			const nameCheck = await db.sequelize.query(`
				select
					tourn.id, tourn.webname
				from tourn
				where 1=1
					and tourn.webname = :webname
				ORDER BY tourn.start DESC
				LIMIT 1
			`, {
				replacements: {webname: tourn.webname},
				type		 : db.sequelize.QueryTypes.SELECT,
			});

			if (nameCheck[0].id !== tourn.id) {
				// I am the current instance of webname
				reply.webname = tourn.webname;
				reply.tournId = tourn.id;
			} else {
				// I am not the current instance of webname, so all URLs must be ID encoded
				reply.webname = tourn.id.toString();
				reply.tournId = tourn.id;
			}

			if (nameCheck.length > 1) {
				reply.multiYear = true;
			}

		} else {
			// If I'm searching by webname, deliver the current ID number
			reply.webname = tourn.webname;
			reply.tournId = tourn.id;
			if (results.length > 1) {
				reply.multiYear = true;
			}
		}
	}
	return res.status(200).json(reply);
}

export async function getThisWeekTourns(req,res){

	const tourns = await db.sequelize.query(`
		select
			 tourn.id, tourn.name, tourn.webname, tourn.start, tourn.end, tourn.city, tourn.state, tourn.country, tourn.tz,
			 count(distinct entry.id) as entries,
			 count(distinct es.student) as competitors,
			 count(distinct school.id) as schools,
			 count(distinct judge.id) as judges
		from (tourn, category)

			left join school on school.tourn = tourn.id

			left join entry on entry.school = school.id and entry.active = 1

			left join entry_student es on es.entry = entry.id

			left join judge on judge.category = category.id

		where 1=1

		  and tourn.hidden = 0
		  and tourn.start < DATE_ADD(NOW(), INTERVAL 7 DAY)
		  and tourn.end > DATE_SUB(NOW(), INTERVAL 1 DAY)
		  and tourn.id = category.id

		  and exists (
			 select ts.id
				 from timeslot ts, round
			 where 1=1
				 and ts.tourn = tourn.id
				 and ts.start < DATE_ADD(NOW(), INTERVAL 7 DAY)
				 and ts.end > DATE_SUB(NOW(), INTERVAL 7 DAY)
				 and ts.id = round.timeslot
		 )

		group by tourn.id
	`, {
		type: db.sequelize.QueryTypes.SELECT,
	});

	const totals = {
		entries	 : 0,
		judges	  : 0,
		schools	 : 0,
		competitors : 0,
		tourns,
	};

	for (const tourn of tourns) {
		totals.entries += tourn.entries;
		totals.judges += tourn.judges;
		totals.schools += tourn.schools;
		totals.competitors += tourn.competitors;
	}
	return res.status(200).json(totals);
}
getThisWeekTourns.openapi = {
	summary	 : 'Returns the public listing of upcoming tournaments in this week',
	operationId : 'listWeeksTourns',
	responses: {
		200: {
			description: "List of this week's tournaments, with some stats",
			content: { 'application/json': { schema: { $ref: '#/components/schemas/Tourn' } } },
		},
	},
	tags: ['invite', 'public'],
};

export async function getFutureTourns(req,res){
	let limit = '';
	let endLimit = '';

	let timeScope = ' DATE(NOW() - INTERVAL 2 DAY)';

	const timeLimit = new Date();
	timeLimit.setDate(timeLimit.getDate() - 3);
	let thisWeekDT = getWeek(timeLimit);

	if (
		process.env.NODE_ENV === 'test'
				|| req.config.MODE === 'test'
	) {
		// the nine test suite tournaments are forever in the past.  This one
		// excludes the Nationals test but not the other eight others.
		timeScope = `'2023-08-01 00:00:00'`;
		thisWeekDT = 1;
	}

	if (typeof req.params.circuit === 'number') {
		limit = ` and exists (
					select tourn_circuit.id from tourn_circuit
					where tourn_circuit.tourn = tourn.id
					and tourn_circuit.approved = 1
					and tourn_circuit.circuit = ${req.params.circuit}
				) `;
	}

	if (typeof req.query.state === 'string' && req.query.state.length === 2) {
		limit = ` and tourn.state = '${req.query.state.toUpperCase()}'`;
	}

	const queryLimit = parseInt(req.query.limit);

	if (!isNaN(queryLimit)) {
		endLimit = ` limit ${req.query.limit} `;
	}

	const future = await db.sequelize.query(`
		select
			CONCAT(tourn.id, '-', '0') as id,
			tourn.id tournId, tourn.webname, tourn.name, tourn.tz,
			tourn.city as location, tourn.state, tourn.country,
			tourn.start start,
			tourn.end end,
			tourn.reg_end regEnd,
			tourn.reg_start regStart,
			msnats.value as msnats,
			nats.value as nats,
			closed.value as closed,
			count(distinct school.id) as schoolcount,
			YEAR(tourn.start) as year,
			WEEK(CONVERT_TZ(tourn.start, '+00:00', tourn.tz), 3) as week,
			GROUP_CONCAT(DISTINCT(circuit.abbr) SEPARATOR ', ') as circuits,
			GROUP_CONCAT(DISTINCT(nsda_category.name) SEPARATOR ', ') as nsdaEventCodes,
			GROUP_CONCAT(DISTINCT(event.abbr) SEPARATOR ', ') as events,
			GROUP_CONCAT(DISTINCT(event.type) SEPARATOR ', ') as eventTypes,
			( select GROUP_CONCAT(signup.abbr SEPARATOR ', ')
					from category signup
				where signup.tourn = tourn.id
					and signup.abbr IS NOT NULL
					and signup.abbr != ''
					and exists ( select cs.id
						from category_setting cs
						where cs.category = signup.id
						and cs.tag = 'public_signups'
					)
					and exists (
						select csd.id
						from category_setting csd
						where csd.category = signup.id
						and csd.tag = 'public_signups_deadline'
						and csd.value_date > ${timeScope}
					)
					and not exists (
						select csd.id
						from category_setting csd
						where csd.category = signup.id
						and csd.tag = 'private_signup_link'
					)
			) as signup,

			( SELECT
				count(online.id)
				from event online, event_setting eso
				where online.tourn = tourn.id
				and online.id = eso.event
				and eso.tag = 'online_mode'
				and not exists (
					select hybridno.id
					from event_setting hybridno
					where hybridno.event = online.id
					and hybridno.tag = 'online_hybrid'
				)
			) as online,

			( SELECT
				count(in_person.id)
				from event in_person
				where in_person.tourn = tourn.id
				and in_person.type != 'attendee'
				and not exists (
					select esno.id
					from event_setting esno
					where esno.event = in_person.id
					and esno.tag = 'online_mode'
				)
			) as inPerson,

			( SELECT
				count(hybrid.id)
				from event hybrid, event_setting esh
				where hybrid.tourn = tourn.id
				and hybrid.id = esh.event
				and esh.tag = 'online_hybrid'
			) as hybrid

		from (tourn, event)

			left join tourn_setting closed
				on closed.tourn = tourn.id
				and closed.tag = 'closed_entry'

			left join tourn_setting msnats
				on msnats.tourn = tourn.id
				and msnats.tag = 'nsda_ms_nats'

			left join tourn_setting nats
				on nats.tourn = tourn.id
				and nats.tag = 'nsda_nats'

			left join nsda_category
				on event.nsda_category = nsda_category.id

			left join school on tourn.id = school.tourn

			left join tourn_circuit tc
				on tc.tourn = tourn.id

			left join circuit
				on tc.circuit = circuit.id

		where 1=1

			and tourn.hidden = 0
			and tourn.end > ${timeScope}
			and tourn.id = event.tourn

			${limit}

			and not exists (
				select weekend.id
				from weekend
				where weekend.tourn = tourn.id
			)

			and exists (
				select timeslot.id
					from timeslot
				where 1=1
					and tourn.id = timeslot.tourn
					and timeslot.end > ${timeScope}
			)

			group by tourn.id
			order by tourn.end, schoolcount DESC
			${ endLimit }
	`, {
		type : db.sequelize.QueryTypes.SELECT,
	});

	const futureDistricts = await db.sequelize.query(`
		select
			CONCAT(tourn.id, '-', weekend.id) as id,
			tourn.id tournId, tourn.webname, tourn.name, tourn.tz,
			weekend.id as districts,
			weekend.id weekendId, weekend.name weekendName, weekend.city as location, weekend.state, tourn.country,
			site.name site,
			weekend.start start,
			weekend.end end,
			weekend.reg_end regEnd,
			weekend.reg_start regStart,
			count(distinct school.id) as schoolcount,
			YEAR(weekend.start) as year,
			WEEK(CONVERT_TZ(weekend.start, '+00:00', tourn.tz), 3) as week,
			GROUP_CONCAT(DISTINCT(circuit.abbr) SEPARATOR ', ') as circuits,
			GROUP_CONCAT(DISTINCT(nsda_category.name) SEPARATOR ', ') as nsdaEventCodes,
			GROUP_CONCAT(DISTINCT(event.abbr) SEPARATOR ', ') as events,
			GROUP_CONCAT(DISTINCT(event.type) SEPARATOR ', ') as eventTypes,
			( select GROUP_CONCAT(signup.abbr SEPARATOR ', ')
					from category signup
				where signup.tourn = tourn.id
					and signup.abbr IS NOT NULL
					and signup.abbr != ''
					and exists ( select cs.id
						from category_setting cs
						where cs.category = signup.id
						and cs.tag = 'public_signups'
					)
					and exists (
						select csd.id
						from category_setting csd
						where csd.category = signup.id
						and csd.tag = 'public_signups_deadline'
						and csd.value_date > ${timeScope}
					)
					and not exists (
						select csd.id
						from category_setting csd
						where csd.category = signup.id
						and csd.tag = 'private_signup_link'
					)
			) as signup,

			( SELECT
				count(online.id)
				from event online, event_setting eso
				where online.tourn = tourn.id
				and online.id = eso.event
				and eso.tag = 'online_mode'
				and not exists (
					select hybridno.id
					from event_setting hybridno
					where hybridno.event = online.id
					and hybridno.tag = 'online_hybrid'
				)
			) as online,

			( SELECT
				count(in_person.id)
				from event in_person
				where in_person.tourn = tourn.id
				and in_person.type != 'attendee'
				and not exists (
					select esno.id
					from event_setting esno
					where esno.event = in_person.id
					and esno.tag = 'online_mode'
				)

			) as inPerson,

			( SELECT
				count(hybrid.id)
				from event hybrid, event_setting esh
				where hybrid.tourn = tourn.id
				and hybrid.id = esh.event
				and esh.tag = 'online_hybrid'
			) as hybrid

		from (tourn, weekend, event, event_setting ew)

			left join site on weekend.site = site.id

			left join school on tourn.id = school.tourn

			left join nsda_category
				on nsda_category.id = event.nsda_category

			left join tourn_circuit tc
				on tc.tourn = tourn.id

			left join circuit
				on tc.circuit = circuit.id

		where 1=1
			and tourn.hidden = 0
			and weekend.end > ${timeScope}
			and weekend.tourn = tourn.id

			and exists (
				select timeslot.id
				from timeslot
				where 1=1
				and timeslot.tourn = tourn.id
				and timeslot.end > ${timeScope}
			)

			and event.tourn = tourn.id
			and event.id = ew.event
			and ew.tag = 'weekend'
			and ew.value = weekend.id

		group by weekend.id
		order by weekend.start
		${ endLimit }
	`, {
		type : db.sequelize.QueryTypes.SELECT,
	});

	future.push(...futureDistricts);

	const shortOptions = {
		month : 'numeric',
		day   : 'numeric',
	};

	const formattedFuture = future.map( (tourn) => {

		// These functions will feel like something the frontend should do. But
		// no, in order to enable searching and filtering, they must be in the
		// original JSON, because components are not perfect

		if (tourn.week < thisWeekDT) {
			tourn.week = thisWeekDT;
		}

		tourn.sortnumeric = parseInt(`${tourn.year}${tourn.week.toString().padStart(2, '0')}${9999999 - tourn.schoolcount}`);
		const tournStart = convertTZ(tourn.start, tourn.tz);
		const tournEnd   = convertTZ(tourn.end, tourn.tz);
		tourn.tzCode     = shortZone(tourn.tz);

		tourn.nsdaEventCodes = tourn.nsdaEventCodes || '';

		tourn.modes = '';
		if (tourn.inPerson) tourn.modes += 'In Person ';
		if (tourn.hybrid) tourn.modes += 'Hybrid ';
		if (tourn.online) tourn.modes += 'Online ';

		if (isSameDay(tournStart, tournEnd)) {
			tourn.dates = tournStart.toLocaleDateString('en-US', shortOptions);
		} else {
			tourn.dates = tournStart.toLocaleDateString('en-US', shortOptions);
			tourn.dates += '-';
			tourn.dates += tournEnd.toLocaleDateString('en-US', shortOptions);
		}

		const eventTypes = tourn.eventTypes.split(', ').filter( (word) => {
			if (word && word !== 'attendee') return word;
		}).map( (word) => {
			if (word === 'mock_trial') return 'Mock Trial';
			if (word === 'wsdc') return 'Worlds';
			if (word === 'wudc') return 'BP';
			return ucfirst(word);
		}).join(', ');

		const tournDateRange = showDateRange({
			startDt : tourn.start,
			endDt   : tourn.end,
			tz      : tourn.tz,
			format  : 'long',
			mode    : 'full',
		});

		return {
			...tourn,
			eventTypes,
			fullDates: tournDateRange.fullOutput,
		};
	});

	formattedFuture.sort( (a, b) => {
		return a.sortnumeric - b.sortnumeric;
	});

	// I have to do this separately because I pull the Districts weekends as
	// separate things from individual tournaments.

	if (req.query.limit > 0) {
		if (future.length > req.query.limit) {
			future.length = req.query.limit;
		}
	} else if (future.length > 256) {
		future.length = 256;
	}

	return res.status(200).json(formattedFuture);
}

getFutureTourns.openapi = {
	summary     : 'Returns the public listing of upcoming tournaments',
	responses   : {
		200: {
			description: 'List of public upcoming tournaments',
			content: { '*/*': { schema: { $ref: '#/components/schemas/Tourn' } } },
		},
	},
	tags: ['futureTourns', 'invite', 'public'],
};
