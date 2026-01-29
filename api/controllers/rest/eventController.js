import db from '../../data/db.js';
import { NotImplemented } from '../../helpers/problem.js';
export async function getTournEvents(req, res) {
	return NotImplemented(req,res,'Not implemented');
};
getTournEvents.openapi = {
	summary: 'Get Tournament Events',
	description: 'Retrieve a list of events associated with a specific tournament.',
	tags: ['Tournaments'],
	responses: {
		200: {
			description: 'List of tournament events',
		},
		404: {
			$ref: '#/components/responses/NotFound',
		},
	},
};

export async function getEntryFieldByEvent(req,res){

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
		const noWaitlist = entries.filter( (entry) => !entry.waitlist);
		return res.status(200).json(noWaitlist);
	}

	return res.status(200).json(entries);
}
export async function getScheduleByEvent(req,res){
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
		replacements: {
			tournId: req.params.tournId,
			eventAbbr: req.params.eventAbbr,
		},
		type: req.db.Sequelize.QueryTypes.SELECT,
	});

	return res.status(200).json(rounds);
}
export async function getEventByAbbr(req,res){
	const eventData = await db.sequelize.query(`
                select
                    event.name eventName,
                    event.id eventId,
                    event.type eventType
                from event
                where 1=1
                    and event.tourn = :tournId
                    and event.abbr = :eventAbbr
            `, {
		replacements : { ...req.params },
		type         : db.Sequelize.QueryTypes.SELECT,
	});

	eventData.rounds = await db.sequelize.query(`
                select
                    round.name roundNumber,
                    round.id roundId,
                    round.label roundLabel
                    round.type roundType
                from round
                where 1=1
                    and round.event = :eventId
                    and round.published != 0
                    order by round.name
            `, {
		replacements : { ...req.params },
		type         : db.Sequelize.QueryTypes.SELECT,
	});

	res.status(200).json(eventData);
}
getEventByAbbr.openapi = {
	summary     : 'Returns some limited data about an event together with published rounds by event abbreviation',
	operationId : 'getEventByAbbr',
	responses: {
		200: {
			description: 'Event and Round in JSON format for parsing',
			content: {
				'application/json': {
					schema: {
						type: 'object',
					},
				},
			},
		},
	},
	tags: ['invite', 'public', 'event', 'eventAbbr', 'rounds'],
};