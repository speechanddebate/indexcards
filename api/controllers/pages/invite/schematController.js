/* eslint-disable no-shadow */
import db from '../../../data/db.js';
import { NotFound } from '../../../helpers/problem.js';

export async function getSchematByRoundId(req,res) {

	const roundData = await db.sequelize.query(`
		select
			event.id eventId, event.name eventName, event.abbr eventAbbr, event.type eventType,
			round.id, round.name, round.label, round.published, round.postPrimary,
			include_room_notes.value includeRoomNotes,
			use_normal_rooms.value useNormalRooms
		from (event, round)

			left join round_setting include_room_notes
				on include_room_notes.tag = 'include_room_notes'
				and include_room_notes.round = panel.round

			left join round_setting use_normal_rooms
				on use_normal_rooms.tag = 'use_normal_rooms'
				and use_normal_rooms.round = panel.round

		where 1=1
			and event.tourn = :tournId
			and event.abbr = :eventAbbr
			and round.name = :roundName
			and event.id = round.event
	`, {
		replacements: { ...req.params },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	const rounds = roundData.map( (round) => {
		return {
			id          : round.id,
			name        : round.name,
			label       : round.label,
			published   : round.published,
			postPrimary : round.postPrimary,
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
			es.id, es.tag, es.value, es.valueDate, es.valueText
		from event_setting es, round
		where 1=1
			and round.id = :roundId
			and es.event = round.event
			and es.tag IN :settingTags
	`, {
		replacements: {
			roundId: req.params.roundId,
			tags : [
				'anonymous_public',
				'pods',
				'no_side_constraints',
				'not_nats',
				'elim_decision_time',
				'prelim_decision_time',
				'online_mode',
				'online_hybrid',
				'online_public',
				'flight_offset',
			],
		},
		type: db.Sequelize.QueryTypes.SELECT,
	});

	round.Event.settings = rawEventSettings.map( (es) => {
		if (es.value === 'text') return  { [es.tag] : [es.valueText] };
		if (es.value === 'json') return  { [es.tag] : JSON.parse(es.valueText) };
		if (es.value === 'date') return  { [es.tag] : new Date(es.valueDate) };
		return { [es.tag]: es.value };
	}).reduce( (acc, setting) => {
		acc[setting.tag] = setting;
		return acc;
	}, {});

	const rawPanels = await db.sequelize.query(`
		select panel.*,
			room.name as roomName, room.notes as roomNotes, room.url as roomUrl, ps.value as hybrid
		from panel

			left join panel_setting ps
				on ps.panel = panel.id
				and ps.tag = 'online_hybrid'

			left join room on panel.room = room.id

		where panel.round = :roundId
			order by panel.bye, room_name, panel.flight
	`, {
		replacements: {
			roundId: req.params.roundId,
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
			left join entry_setting pod on pod.entry = ballot.entry and pod.tag = 'pod'

		where 1=1
			and section.round = :roundId
			and section.id = ballot.panel
			and ballot.entry = entry.id

		order by ballot.chair, ballot.judge, ballot.side
	`, {
		replacements: {
			roundId: req.params.roundId,
		},
		type: db.Sequelize.QueryTypes.SELECT,
	});

	rawBallots.forEach( (ballot) => {

		if (!round.Sections[ballot.sectionId][ballot.side]) {
			round.Sections[ballot.sectionId][ballot.side] = {
				id           : ballot.entryId,
				code         : ballot.entryCode,
				speakerorder : ballot.speakerorder,
				personId     : 0,
			};

			if (ballot.studentPersonIds) {
				ballot.studentPersons = ballot.studentPersons.split(',');
			}

			if (req.person
				&& ballot.studentPersons
				&& ballot.studentPersons.includes(req.person.id)
			) {
				round.Sections[ballot.sectionId].me = true;
				round.Sections[ballot.sectionId][ballot.side].personId = req.person.id;
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

	return round;
}