import db from '../../data/db.js';
import { NotImplemented, NotFound } from '../../helpers/problem.js';

export async function getTournEvents(req, res) {
	return NotImplemented(req,res,'Not implemented');
};

export async function getEntryFieldByEvent(req,res) {

	const events = await db.sequelize.query(`
		select
			event.*,
            field_waitlist.value fieldWaitlist,
            field_report.value fieldReport
		from event

            left join event_setting field_report
                on field_report.event = event.id
                and field_report.tag = 'field_report'

            left join event_setting field_waitlist
                on field_waitlist.event = event.id
                and field_waitlist.tag = 'field_waitlist'
		where 1=1
            and event.tourn = :tournId
            and event.abbr  = :eventAbbr
		limit 1
	`, {
		replacements: {
			tournId   : req.params.tournId,
			eventAbbr : req.params.eventAbbr,
		},
		type: req.db.Sequelize.QueryTypes.SELECT,
	});

	if (!events || events.length < 1) {
		return NotFound(req, res, `No valid event abbreviation sent`);
	}

	if (!events[0].fieldReport) {
		return NotFound(req, res, `Tournament has not posted that event field report`);
	}

	const event = {
		name       : events[0].name,
		id         : events[0].id,
		abbr       : events[0].name,
		type       : events[0].type,
		categoryId : events[0].category,
		tournId    : events[0].tourn,
		settings   : {
			fieldWaitlist: events[0].fieldWaitlist,
			fieldReport: events[0].fieldReport,
		},
		Entries    : [],
	};

	const entries = await db.sequelize.query(`
        SELECT
            entry.id, entry.code, entry.name,
            entry.active, entry.waitlist,
			school.id schoolId,
				school.name schoolName,
				school.code schoolCode,
			student.id studentId,
				student.first studentFirst,
				student.middle studentMiddle,
				student.last studentLast,
				student.chapter chapterId
        from (entry, event)
            left join school on school.id = entry.school
            left join entry_student es on es.entry = entry.id
            left join student on student.id = es.student
        where 1=1
            and event.id = :eventId
			and event.id = entry.event
            and exists (
                select fr.id
                from event_setting fr
                where 1=1
                    and fr.event = event.id
                    and fr.tag = 'field_report'
            )
            and (entry.active = 1 OR entry.waitlist = 1)
        group by entry.id
        order by entry.code, entry.name
    `, {
		replacements: {
			eventId   : event.id,
		},
		type: req.db.Sequelize.QueryTypes.SELECT,
	});

	const entryById = {};

	entries.forEach( (entry) => {
		if (!event.fieldWaitlist && entry.waitlist) return;
		if (!entryById[entry.id]) {
			entryById[entry.id] = {
				id       : entry.id,
				name     : entry.name,
				code     : entry.code,
				active   : entry.active,
				waitlist : entry.waitlist,
				School   : {
					id   : entry.schoolId,
					name : entry.schoolName,
					code : entry.schoolCode,
				},
				Students : [],
			};
		}

		entryById[entry.id].Students.push({
			id         : entry.studentId,
			firstName  : entry.studentFirst,
			middleName : entry.studentMiddle,
			lastName   : entry.studentLast,
			chapterId  : entry.chapterId,
		});
	});

	event.Entries = Object.keys(entryById).map( (entryId) => {
		return entryById[entryId];
	});

	return res.status(200).json(event);
};

export async function getScheduleByEvent(req,res) {
	const rounds = await db.sequelize.query(`
        select
            round.id, round.name, round.label, round.type,
            round.start_time,
            site.name,
            timeslot.start, timeslot.end
        from (round, timeslot, event)
            left join site on site.id = round.site
        where 1=1
            and event.tourn = :tournId
            and event.abbr = :eventAbbr
            and event.id = round.event
            and round.timeslot = timeslot.id
            and NOT EXISTS (
                select rs.id
                from round_setting rs
                where rs.event = event.id
                and rs.tag = 'suppress_schedule'
            )
        order by round.name
    `, {
		replacements  : {
			tournId   : req.params.tournId,
			eventAbbr : req.params.eventAbbr,
		},
		type: req.db.Sequelize.QueryTypes.SELECT,
	});

	return res.status(200).json(rounds);
};

export async function getEventByAbbr(req, res) {

	if (!req.params.eventAbbr) {
		return NotFound(req, res, `No valid event abbreviation sent`);
	}

	const eventData = await db.sequelize.query(`
		select
			event.id,
			event.name,
			event.type,
			event.code_style
		from event
		where 1=1
			and event.tourn = :tournId
			and event.abbr = :eventAbbr
	`, {
		replacements : { ...req.params },
		type         : db.Sequelize.QueryTypes.SELECT,
	});

	if (!eventData || eventData.length !== 1) {
		return NotFound(
			req,
			res,
			`No event ${req.params.eventAbbr} found in tournament ${req.params.tournId}`
		);
	}

	// Latch to the one event
	const event = eventData[0];

	event.rounds = await db.sequelize.query(`
		select
			round.id,
			round.name,
			round.label,
			round.type,
			round.published
		from round
		where 1=1
			and round.event = :eventId
			and round.published != 0
			order by round.name
	`, {
		replacements : {
			eventId  : event.id,
			...req.params,
		},
		type : db.Sequelize.QueryTypes.SELECT,
	});

	return res.status(200).json(event);
};
