import db from '../../data/db.js';
import { NotImplemented, NotFound } from '../../helpers/problem.js';

export async function getTournEvents(req, res) {
	return NotImplemented(req,res,'Not implemented');
};

export async function getEntryFieldByEvent(req,res) {

	const entries = await db.sequelize.query(`
        select
            entry.id, entry.code, entry.name,
            entry.active, entry.waitlist,
            school.name schoolName, school.code schoolCode,
            GROUP_CONCAT(student.id) as studentIds,
            GROUP_CONCAT(CONCAT(student.first, ' ', student.last)) as studentNames,
            field_waitlist.value fieldWaitlist

        from (entry, event)
            left join school on school.id = entry.school
            left join entry_student es on es.entry = entry.id
            left join student on student.id = es.student
            left join event_setting field_waitlist
                on field_waitlist.event = event.id
                and field_waitlist.tag = 'field_waitlist'

        where 1=1

            and event.tourn = :tournId
            and event.abbr  = :eventAbbr
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
			tournId   : req.params.tournId,
			eventAbbr : req.params.eventAbbr,
		},
		type: req.db.Sequelize.QueryTypes.SELECT,
	});

	if (entries && entries.length > 0 && !entries[0].fieldWaitlist) {
		const noWaitlist = entries.filter( (entry) => !entry.waitlist ).map( (entry) => {
			delete entry.fieldWaitlist;
			delete entry.waitlist;
			return entry;
		});

		return res.status(200).json({ entries: noWaitlist, showWaitlist: false});
	}

	return res.status(200).json({entries, showWaitlist: true});
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

export async function getEventByAbbr(req, res){

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
