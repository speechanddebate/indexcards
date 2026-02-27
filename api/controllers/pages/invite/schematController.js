import db from '../../../data/db.js';
import { parseDateTime } from '../../../helpers/dateTime.js';
import { NotFound } from '../../../helpers/problem.js';
import { snakeToCamel } from '../../../helpers/text.js';

export async function getSchematic(req,res) {

	const roundData = await db.sequelize.query(`
		select
			event.id eventId, event.name eventName, event.abbr eventAbbr, event.type eventType,
			round.id, round.name, round.label, round.start_time startTime, round.flighted,
			round.type,
			round.published, round.post_primary postPrimary,
			timeslot.start timeslotStart, tourn.tz,
			include_room_notes.value includeRoomNotes,
			use_normal_rooms.value useNormalRooms,
			notes.value_text notes,
			motion.value_text motion

		from (event, round, timeslot, tourn)

			left join round_setting notes
				on notes.tag = 'notes'
				and notes.round = round.id

			left join round_setting motion
				on motion.tag = 'motion'
				and motion.round = round.id
				and EXISTS (
					select published.id
					from round_setting published
					where published.tag = 'motion_publish'
					and published.round = round.id
					and published.value = 1
			)

			left join round_setting include_room_notes
				on include_room_notes.tag = 'include_room_notes'
				and include_room_notes.round = round.id

			left join round_setting use_normal_rooms
				on use_normal_rooms.tag = 'use_normal_rooms'
				and use_normal_rooms.round = round.id

		where 1=1
			and event.tourn = :tournId
			and tourn.id    = event.tourn
			and event.abbr  = :eventAbbr
			and round.name  = :roundName
			and event.id    = round.event
			and round.published > 0
			and round.timeslot = timeslot.id
	`, {
		replacements: { ...req.params },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	const rounds = roundData.map( (round) => {

		const startTime = new Date(round.startTime || round.timeslotStart);

		return {
			id          : round.id,
			name        : round.name,
			type        : snakeToCamel(round.type),
			label       : round.label,
			tz          : round.tz,
			motion      : round.motion,
			message     : round.notes,
			published   : round.published,
			postPrimary : round.postPrimary,
			flighted    : round.flighted || 1,
			startTime,
			settings : {
				includeRoomNotes : round.includeRoomNotes,
				useNormalRooms   : round.useNormalRooms,
			},
			Event    : {
				id   : round.eventId,
				name : round.eventName,
				abbr : round.eventAbbr,
				type : round.eventType,
				settings: {},
			},
		};
	});

	if (!rounds) {
		return NotFound(req, res,
			`Round ${req.params.roundName} of ${req.params.eventAbbr} either does not exist or is not yet published.`
		);
	};

	const round = rounds[0];

	const rawEventSettings = await db.sequelize.query(`
		select
			es.id, es.tag, es.value, es.value_date valueDate, es.value_text valueText
		from event_setting es, round
		where 1=1
			and round.id = :roundId
			and es.event = round.event
			and es.tag IN (:settingTags)
	`, {
		replacements: {
			roundId: round.id,
			settingTags : [
				'anonymous_public',
				'pods',
				'no_side_constraints',
				'not_nats',
				'elim_decision_deadline',
				'prelim_decision_deadline',
				'online_mode',
				'online_hybrid',
				'online_public',
				'flight_offset',
			],
		},
		type: db.Sequelize.QueryTypes.SELECT,
	});

	round.Event.settings = rawEventSettings.map( (es) => {
		const tag = snakeToCamel(es.tag);
		if (es.value === 'text') return  { tag, value : [es.valueText] };
		if (es.value === 'json') return  { tag, value : JSON.parse(es.valueText) };
		if (es.value === 'date') return  { tag, value : new Date(es.valueDate) };
		return { tag, value : es.value };
	}).reduce( (acc, setting) => {
		acc[setting.tag] = setting.value;
		return acc;
	}, {});

	// Mapping start times and decision deadlines. Doing it here and not on
	// the front end because syncing up this logic together with reactivity
	// is a right royal nightmare, and I don't trust other frontends to do
	// it properly either.

	round.times = { };
	let tick = 0;

	while (tick < round.flighted) {

		const flightTimes = {};

		// Start Time
		const offset = {};
		if (round.Event.settings.flightOffset && tick > 0) {
			offset.minutes = tick * parseInt(round.Event.settings.flightOffset);
		} else if (tick > 0) {
			// Do not display flight differentials unless there's an offset;
			continue;
		}

		flightTimes.start= parseDateTime({
			dt : round.startTime,
			offset,
		});

		// Timezones.  For online tournaments show both user and tournament.
		// Frontend handles translation here, just need to tag which ones to
		// show.

		flightTimes.tz = [round.tz];
		if ( round.Event.settings.onlineMode
			&& req.person.tz !== round.tz
		) {
			flightTimes.tz.push(req.person.tz);
		}

		// Decision deadlines only get populated if there is an appropriate
		// offset.  If there is no special elim offset, the prelim offset
		// applies.  Same rules for flights

		offset.minutes = 0;

		if (['prelim', 'highhigh', 'highlow', 'snaked_prelim'].includes(round.type)) {
			if (round.Event.settings.prelimDecisionDeadline) {
				offset.minutes = parseInt(round.Event.settings.prelimDecisionDeadline);
			}
		} else {
			if (round.Event.settings.elimDecisionDeadline) {
				offset.minutes = round.Event.settings.elimDecisionDeadline;
			} else if (round.Event.settings.prelimDecisionDeadline) {
				offset.minutes = parseInt(round.Event.settings.prelimDecisionDeadline);
			}
		}

		if (offset.minutes > 0) {
			if (round.Event.settings.flightOffset && tick > 0) {
				offset.minutes += tick * parseInt(round.Event.settings.flightOffset);
			}

			flightTimes.deadline = parseDateTime({
				dt : round.startTime,
				offset,
			});
		}

		tick++;
		round.times[tick] = flightTimes;
	}

	const rawPanels = await db.sequelize.query(`
		select panel.id,
			panel.letter, panel.flight, panel.bye, panel.publish,
			room.name as roomName, room.notes as roomNotes,
			room.url as roomUrl, ps.value as hybrid
		from panel

			left join panel_setting ps
				on ps.panel = panel.id
				and ps.tag = 'online_hybrid'

			left join room on panel.room = room.id

		where panel.round = :roundId
			order by panel.bye, room.name, panel.flight
	`, {
		replacements: {
			roundId: round.id,
		},
		type: db.Sequelize.QueryTypes.SELECT,
	});

	round.Sections = rawPanels.reduce((acc, section) => {
		acc[section.id] = section;
		return acc;
	}, {});

	const rawBallots = await db.sequelize.query(`
		select
			section.id sectionId,
			ballot.side, ballot.speakerorder, ballot.chair,
			entry.id entryId, entry.code entryCode,
			judge.id judgeId, judge.first judgeFirst, judge.last judgeLast,
			judge.code judgeCode,
			judge.person judgePersonId,
			(
				SELECT GROUP_CONCAT(student.person SEPARATOR ',')
					from entry_student es, student
				where es.entry = ballot.entry
					and es.student = student.id
			) as studentPersonIds

		from (ballot, panel section, entry)
			left join judge on judge.id = ballot.judge
			left join entry_setting pod
				on pod.entry = ballot.entry
				and pod.tag = 'pod'

		where 1=1
			and section.round = :roundId
			and section.id = ballot.panel
			and ballot.entry = entry.id

		order by ballot.chair, ballot.judge, ballot.side
	`, {
		replacements: {
			roundId: round.id,
		},
		type: db.Sequelize.QueryTypes.SELECT,
	});

	rawBallots.forEach( (ballot) => {

		let orderKey = ballot.side || ballot.speakerorder;

		if (!round.Sections[ballot.sectionId].entries) {
			round.Sections[ballot.sectionId].entries = {};
			round.Sections[ballot.sectionId].judges = {};
		}

		if (!round.Sections[ballot.sectionId].entries[orderKey]) {

			round.Sections[ballot.sectionId].entries[orderKey] = {
				id           : ballot.entryId,
				code         : ballot.entryCode,
				speakerorder : ballot.speakerorder,
			};

			if (ballot.studentPersonIds) {
				ballot.studentPersons = ballot.studentPersonIds.split(',').map(Number);
			}

			if (req.person
				&& ballot.studentPersons
				&& ballot.studentPersons.includes(req.person.id)
			) {
				round.Sections[ballot.sectionId].me = true;
				round.Sections[ballot.sectionId].entries[orderKey].me = true;
			}
		}

		if (!round.Sections[ballot.sectionId].judges[ballot.judgeId]) {
			let me = false;

			if (req.person && ballot.judgePersonId == req.person.id) {
				round.Sections[ballot.sectionId].me = true;
				me = true;
			}

			round.Sections[ballot.sectionId].judges[ballot.judgeId] = {
				id     : ballot.id,
				first  : ballot.judgeFirst,
				last   : ballot.judgeLast,
				code   : ballot.judgeCode,
				chair  : ballot.chair,
				person : ballot.person,
				me,
			};

			if (round.Event.settings.anonymousPublic) {
				delete ballot.judgeFirst;
				delete ballot.judgeLast;
			}
		}
	});

	return res.status(200).json(round);
}