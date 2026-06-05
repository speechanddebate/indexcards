import db from '../../../data/db.js';
import { parseDateTime } from '../../../helpers/dateTime.js';
import { NotFound } from '../../../helpers/problem.js';
import { publishLevel, snakeToCamel } from '../../../helpers/text.js';
import { settingsMapper } from '../../../helpers/settings.js';
import { entryWins } from '../../../services/results/entryWins.js';

export async function getSchematic (req,res) {

	let finders = '';

	if (req.params.eventId) finders += ' and event.id = :eventId ';
	if (req.params.eventAbbr) finders += ' and event.abbr = :eventAbbr ';
	if (req.params.roundId) finders += ' and round.id = :roundId ';
	if (req.params.roundName) finders += ' and round.name = :roundName ';

	if (!finders) {
		return NotFound(req, res, 'No parameters for retrieval sent');
	}

	const roundData = await db.sequelize.query(`
		select
			event.id eventId, event.name eventName, event.abbr eventAbbr, event.type eventType,
			event.nsda_category nsdaCategory,
			round.id, round.name, round.label, round.start_time startTime, round.flighted,
			round.type,
			round.published, round.post_primary postPrimary,
			timeslot.start timeslotStart, tourn.tz,

			(select motion.value_text
				from round_setting motion
				where motion.tag = 'motion'
				and motion.round = round.id
				and EXISTS (
					select published.id
					from round_setting published
					where published.tag = 'motion_publish'
					and published.round = round.id
					and published.value = 1
				)
			) as motion,

			(select notes.value
				from round_setting notes
				where notes.tag = 'notes'
				and notes.round = round.id
			) as notes,

			( select include_room_notes.value
				from round_setting include_room_notes
				where include_room_notes.tag = 'include_room_notes'
				and include_room_notes.round = round.id
			) as includeRoomNotes,

			( select use_normal_rooms.value
				from round_setting use_normal_rooms
				where use_normal_rooms.tag = 'use_normal_rooms'
				and use_normal_rooms.round = round.id
			) as useNormalRooms

		from (event, round, timeslot, tourn)

		where 1=1
			and event.tourn = :tournId
			and tourn.id    = event.tourn
			${finders}
			and event.id    = round.event
			and round.published > 0
			and round.timeslot = timeslot.id
			and exists (
				select panel.id
				from panel, ballot
				where panel.round = round.id
				and panel.id = ballot.panel
				and ballot.entry > 0
			)
	`, {
		replacements: { ...req.params },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	const rounds = roundData.map( (round) => {

		const startTime = new Date(round.startTime || round.timeslotStart);

		const Settings = {};
		if (round.includeRoomNotes) Settings.includeRoomNotes = true;
		if (round.useNormalRooms) Settings.useNormalRooms = true;

		const parsedRound = {
			id          : round.id,
			name        : round.name,
			type        : snakeToCamel(round.type),
			label       : round.label,
			tz          : round.tz,
			motion      : round.motion,
			message     : round.notes,
			published   : publishLevel(round.published),
			postPrimary : round.postPrimary,
			flighted    : round.flighted || 1,
			startTime,
			Settings,
			Event    : {
				id           : round.eventId,
				name         : round.eventName,
				abbr         : round.eventAbbr,
				type         : round.eventType,
				nsdaCategory : round.nsdaCategory,
				Settings     : {},
			},
		};

		Object.keys(parsedRound).forEach( (key) => {
			if (parsedRound[key] === null)  delete parsedRound[key];
		});

		return parsedRound;
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
				'aff_label',
				'neg_label',
				'prep_offset',
			],
		},
		type: db.Sequelize.QueryTypes.SELECT,
	});

	const sets = settingsMapper(rawEventSettings);
	round.Event.Settings = sets.settings;

	// Mapping start times and decision deadlines. Doing it here and not on the
	// front end because syncing up this logic together with reactivity is a
	// right royal nightmare, and I don't trust other frontends to do it
	// properly either because localization can lie.

	round.times = showFlightTimes(round, req.person.tz);

	// Now the publication level determines what the person gets back.  Entry
	// List is the easiest.

	if (round.published === 'entryList' || round.published === 'prelimChambers') {

		const rawEntries = await db.sequelize.query(`
			select
				entry.id, entry.code,
				section.bye, section.letter chamber
			from (panel section, ballot, entry)
			where 1=1
				and section.round = :roundId
				and section.id = ballot.panel
				and ballot.entry = entry.id
			order by entry.code
		`, {
			replacements: { roundId: round.id },
			type: db.Sequelize.QueryTypes.SELECT,
		});

		round.Entries = rawEntries.map( (entry) => {
			const e = { ...entry };
			if (!entry.bye)  delete e.bye;
			if (round.published !== 'prelimChambers') delete e.chamber;
			return e;
		});

	} else if (round.published === 'full' || round.published === 'noJudges') {

		const rawPanels = await db.sequelize.query(`
			select panel.id,
				panel.letter, panel.flight, panel.bye,
				room.id roomId, room.name as roomName,
				room.notes as roomNotes, room.url as roomUrl,
				ps.value as hybrid
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

			Object.keys(section).forEach( (key) => {
				if (section[key] === null)  delete section[key];
				if (section[key] === '')  delete section[key];
				if (section[key] === 0)  delete section[key];
			});

			section.Room = {
				id: section.roomId,
				name: section.roomName,
			};

			if (section.roomUrl) 	section.Room.url = section.roomUrl;
			if (round.includeRoomNotes && section.roomNotes) {
				section.Room.notes = section.roomNotes;
			}

			delete section.roomId;
			delete section.roomName;
			delete section.roomUrl;
			delete section.roomNotes;

			acc[section.id] = section;
			return acc;
		}, {});

		const rawBallots = await db.sequelize.query(`
			select
				section.id sectionId,
				ballot.side, ballot.speakerorder, ballot.chair,
				entry.id entryId, entry.code entryCode,
				judge.id judgeId, judge.first judgeFirst, judge.last judgeLast,
				judge.code judgeCode, judge.person judgePerson,
				( select paradigm.person
						from person_setting paradigm
					where 1=1
						and paradigm.person > 0
						and paradigm.person = judge.person
						and paradigm.tag = 'paradigm'
				) as judgeParadigm

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

			if (!round.Sections[ballot.sectionId].Entries) {
				round.Sections[ballot.sectionId].Entries  = {};
				round.Sections[ballot.sectionId].Judges   = {};
			}

			if (!round.Sections[ballot.sectionId].Entries[orderKey]) {
				round.Sections[ballot.sectionId].Entries[orderKey] = {
					id           : ballot.entryId,
					code         : ballot.entryCode,
					speakerorder : ballot.speakerorder,
				};
			}

			if (round.published === 'full') {
				if (!round.Sections[ballot.sectionId].Judges[ballot.judgeId]) {

					const judge = {
						id     : ballot.id,
						first  : ballot.judgeFirst,
						last   : ballot.judgeLast,
					};

					if (ballot.judgeParadigm) judge.paradigm = ballot.judgeParadigm;
					if (ballot.chair) judge.chair = ballot.chair;
					if (ballot.judgeCode) judge.code = ballot.judgeCode;

					if (round.Event.Settings.anonymousPublic) {
						delete ballot.judgeFirst;
						delete ballot.judgeLast;
						delete judge.first;
						delete judge.last;
						delete judge.paradigm;
					}
					round.Sections[ballot.sectionId].Judges[ballot.judgeId] = judge;
				}
			}
		});

		if (round.postPrimary) {
			const brackets = await entryWins({ roundId: round.id, eventId: round.Event.id });

			Object.keys(round.Sections).forEach( (sectionId) => {

				const section = round.Sections[sectionId];
				section.bracket = 0;

				Object.keys(section.Entries).forEach( (entryOrder) => {
					const entryId = section.Entries[entryOrder].id;
					if (!brackets[entryId]) return;
					section.Entries[entryOrder].record = brackets[entryId].record;
					section.Entries[entryOrder].wins = brackets[entryId].wins;
					if (section.bracket < brackets[entryId].wins) {
						section.bracket = brackets[entryId].wins;
					}
				});

				Object.keys(section.Entries).forEach( (entryOrder) => {
					const entryId = section.Entries[entryOrder].id;
					if (!brackets[entryId]) return;
					if (section.bracket > brackets[entryId].wins) {
						section.Entries[entryOrder].pullup = section.bracket - brackets[entryId].wins;
					}
				});
			});
		}
	}

	return res.status(200).json(round);
}

const showFlightTimes = (round, personTz = undefined) => {

	const times = {};
	let tick = 0;

	while (tick < round.flighted) {

		const flightTimes = {};

		// Start Time
		const offset = {};
		if (round.Event.Settings?.flightOffset && tick > 0) {
			offset.minutes = tick * parseInt(round.Event.Settings.flightOffset);
		} else if (tick > 0) {
			// Do not display flight differentials unless there's an offset;
			continue;
		}

		flightTimes.start= parseDateTime({
			dt : round.startTime,
			offset,
		});

		// Prep Room Draw time offset for Extemp.
		if (round.Event.Settings.prepOffset) {
			offset.minutes = -1 * round.Event.Settings.prepOffset;
			if (round.Event.Settings.flightOffset && tick > 0) {
				offset.minutes += tick * parseInt(round.Event.Settings.flightOffset);
			}

			flightTimes.draw = parseDateTime({
				dt : round.startTime,
				offset,
			});
		}

		// Timezones.  For online tournaments show both user and tournament.
		// Frontend handles translation here, just need to tag which ones to
		// show.

		flightTimes.tz = [round.tz];

		if ( round.Event.Settings.onlineMode
			&& personTz
			&& personTz !== round.tz
		) {
			flightTimes.tz.push(personTz);
		}

		// Decision deadlines only get populated if there is an appropriate
		// offset.  If there is no special elim offset, the prelim offset
		// applies.  Same rules for flights

		offset.minutes = 0;

		if (['prelim', 'highhigh', 'highlow', 'snaked_prelim'].includes(round.type)) {
			if (round.Event.Settings.prelimDecisionDeadline) {
				offset.minutes = parseInt(round.Event.Settings.prelimDecisionDeadline);
			}
		} else {
			if (round.Event.Settings.elimDecisionDeadline) {
				offset.minutes = round.Event.Settings.elimDecisionDeadline;
			} else if (round.Event.Settings.prelimDecisionDeadline) {
				offset.minutes = parseInt(round.Event.Settings.prelimDecisionDeadline);
			}
		}

		if (offset.minutes > 0) {
			if (round.Event.Settings.flightOffset && tick > 0) {
				offset.minutes += tick * parseInt(round.Event.Settings.flightOffset);
			}

			flightTimes.deadline = parseDateTime({
				dt : round.startTime,
				offset,
			});
		}

		tick++;
		times[tick] = flightTimes;
	}

	return times;
};
