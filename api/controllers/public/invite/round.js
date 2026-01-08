import { NotFound } from '../../../helpers/problem.js';
import db from '../../../data/db.js';

// These are essentially controllers.  I think they do more than "controllers"
// are supposed to do, but to be honest I've read about them for two weeks, I
// still dont' know what controllers are supposed to do, and as far as I can
// tell the answer might be "nothing" in which case, why do they even exist?
//
// So here I'm using them for data validation

export const getRound = {

	GET: async (req, res) => {

		const round = await getRoundById(req.params.roundId);

		if (!round) {
			return NotFound(req, res, `No round found with ID ${req.params.roundID}`);
		}

		if (round.tournId !== req.params.tournId) {
			return NotFound(req, res,
				`No round found with ID ${req.params.roundID} belonging to tournament ${req.params.tournId}`
			);
		}

		delete round.tournId;
		delete round.pods;
		delete round.noJudgeCodes;
		delete round.sidelockElims;
		delete round.noSideConstraints;
		delete round.affLabel;
		delete round.negLabel;
		delete round.showSectionLetters;
		delete round.includeRoomNotes;
		delete round.useNormalRooms;

		return res.status(200).json(round);
	},
};

getRound.GET.apiDoc = {
	summary     : 'Returns round information given an ID if it is public',
	operationId : 'getRound',
	parameters  : [
		{
			in          : 'path',
			name        : 'tournId',
			description : 'Tournament ID to return events for',
			required    : false,
			schema      : { type: 'number', minimum: 1 },
		}, {
			in          : 'path',
			name        : 'roundId',
			description : 'Round ID to return schematics for',
			required    : false,
			schema      : { type: 'number', minimum: 1 },
		},
	],
	responses: {
		200: {
			description: 'Object of Round with public information on it',
			content: {
				'application/json': {
					schema: {
						type: 'object',
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['invite', 'public', 'schematics', 'rounds', 'pairings'],
};

export const getSchematic = {

	GET: async (req, res) => {

		const round = await getRoundById(req.params.roundId);

		if (!round) {
			return NotFound(req, res, `No round found with ID ${req.params.roundID}`);
		}

		let sections = await getSectionsByRound(round.id);

		// If things are anonymous, just cut all identifying information out
		// now. I do this here and not within sections because a lot of it is
		// keyed to aspects of the round settings

		if (round.anonymous_public) {

			sections = sections.map ( (section) => {
				delete section.entryName;
				delete section.entryId;
				delete section.entrySchoolId;
				delete section.judgeId;
				delete section.judgeSchoolId;
				delete section.judgeFirst;
				delete section.judgeLast;
				return section;
			});
		}

		if ( round.published === 'entryList') {

			const entries = sections.map( (section) => {
				return {
					entryId     : section.entryId,
					entryCode   : section.entryCode,
					entrySchool : section.entrySchoolId,
					entryName   : section.entryName,
				};
			});

			round.entries = [...new Set(entries)];
			return res.status(200).json(round);
		}

		if ( round.published === 'chambers') {

			const entries = sections.map( (section) => {
				return {
					entryId   : section.entryId,
					entryCode : section.entryCode,
					entryName : section.entryName,
					chamber   : section.letter,
					roomName  : section.roomName,
				};
			});

			round.entries = [...new Set(entries)];
			return res.status(200).json(round);
		}

		if (round.published === 'noJudges') {
			sections = sections.map ( (section) => {
				delete section.judgeCode;
				return section;
			});
		}

		// If I'm here it's a true pairing and therefore needs populated sections.

		round.sections = {};

		for (const section of sections) {

			if (!round.sections[section.id]) {

				round.sections[section.id] = {
					id        : section.id,
					bye       : section.bye ? true : false,
					roomName  : section.roomName,
					roomId    : section.roomId,
					judges    : {},
					entries   : {},
					judgeKeys : [],
					entryKeys : [],
				};

				if (round.showSectionLetters) {
					round.sections[section.id].letter = section.letter;
				}

				if (round.flighted) {
					round.sections[section.id].flight = section.flight;
				}

				if (round.includeRoomNotes) {
					round.sections[section.id].roomNotes = section.roomNotes;
				}
				if (section.roomUrl) {
					round.sections[section.id].roomUrl = section.roomUrl;
				}
			}

			if (!round.sections[section.id].judges[section.judgeId]) {

				const judge = {
					id     : section.judgeId,
					first  : section.judgeFirst,
					middle : section.judgeMiddle,
					last   : section.judgeLast,
					chair  : section.judgeChair,
					school : section.judgeSchoolId,
				};

				if ( !section.noJudgeCodes && section.judgeCode) {
					judge.code = section.judgeCode;
				}

				round.sections[section.id].judges[section.judgeId] = judge;

				// This is redundant yes but it's handy and the front end is
				// going to have to do the same, so save it steps.

				round.sections[section.id].judgeKeys.push(judge.id);
			}

			if (!round.sections[section.id].entries[section.entryId]) {

				const entry = {
					id       : section.entryId,
					schoolId : section.entrySchoolId,
					first    : section.entryName,
					code     : section.entryCode,
				};

				if (section.side) {
					entry.side = section.side;
				}

				if (section.speakerorder) {
					entry.speakerOrder = section.speakerorder;
				}

				round.sections[section.id].entries[section.entryId] = entry;
				round.sections[section.id].entryKeys.push(entry.id);
			}
		}

		delete round.noJudgeCodes;
		delete round.includeRoomNotes;
		return res.status(200).json(round);
	},
};

getSchematic.GET.apiDoc = {
	summary     : 'Returns public round information necessary to create a full schematic',
	operationId : 'getSchematic',
	parameters  : [
		{
			in          : 'path',
			name        : 'tournId',
			description : 'Tournament ID to return events for',
			required    : false,
			schema      : { type: 'number', minimum: 1 },
		}, {
			in          : 'path',
			name        : 'roundId',
			description : 'Round ID to return schematics for',
			required    : false,
			schema      : { type: 'number', minimum: 1 },
		},
	],
	responses: {
		200: {
			description: 'Object of Round with public information on it for a schematic, which includes a list of entries or sections as appropriate.',
			content: {
				'application/json': {
					schema: {
						type: 'object',
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['invite', 'public', 'schematics', 'rounds', 'pairings'],
};

// These become tailored Repos or the equivalent, I think.

const getRoundById = async (roundId) => {

	const rounds = await db.sequelize.query(`
		select
			round.id, round.name, round.label, round.type tag,
			round.published, round.post_primary, round.post_secondary,
			round.start_time startTime, timeslot.start timeslotStartTime,
			round.flighted,

			motion_published.value motionPublished,
			motion.value_text motion,
			include_room_notes.value includeRoomNotes,
			use_normal_rooms.value useNormalRooms,

			event.id eventId, event.name eventName, event.type eventTag,
			event.abbr eventAbbr,
			event.tourn tournId,

			pods.value_text pods,
			no_side_constraints.value_text noSideConstraints,
			sidelock_elims.value_text sidelockElims,
			aff_label.value_text affLabel,
			neg_label.value_text negLabel,
			show_panel_letters.value_text showSectionLetters,
			online_mode.value onlineMode,
			online_public.value onlinePublic,
			elim_decision_deadline.value elimDecisionDeadline,
			prelim_decision_deadline.value prelimDecisionDeadline,
			no_codes.value noJudgeCodes

		from (round, event, category, timeslot)

			left join round_setting motion
				on motion.round = round.id
				and motion.tag = 'motion'

			left join round_setting motion_published
				on motion_published.round = round.id
				and motion_published.tag = 'motion_published'

			left join round_setting include_room_notes
				on include_room_notes.round = round.id
				and include_room_notes.tag = 'include_room_notes'

			left join round_setting use_normal_rooms
				on use_normal_rooms.round = round.id
				and use_normal_rooms.tag = 'use_normal_rooms'

			left join event_setting online_mode
				on online_mode.event = event.id
				and online_mode.tag = 'online_mode'

			left join event_setting online_public
				on online_public.event = event.id
				and online_public.tag = 'online_public'

			left join event_setting anonymous_public
				on anonymous_public.event = event.id
				and anonymous_public.tag = 'anonymous_public'

			left join event_setting pods
				on pods.event = event.id
				and pods.tag = 'pods'

			left join event_setting no_side_constraints
				on no_side_constraints.event = event.id
				and no_side_constraints.tag = 'no_side_constraints'

			left join event_setting sidelock_elims
				on sidelock_elims.event = event.id
				and sidelock_elims.tag = 'sidelock_elims'

			left join event_setting aff_label
				on aff_label.event = event.id
				and aff_label.tag = 'aff_label'

			left join event_setting neg_label
				on neg_label.event = event.id
				and neg_label.tag = 'neg_label'

			left join event_setting show_panel_letters
				on show_panel_letters.event = event.id
				and show_panel_letters.tag = 'show_panel_letters'

			left join event_setting elim_decision_deadline
				on elim_decision_deadline.event = event.id
				and elim_decision_deadline.tag = 'elim_decision_deadline'

			left join event_setting prelim_decision_deadline
				on prelim_decision_deadline.event = event.id
				and prelim_decision_deadline.tag = 'prelim_decision_deadline'

			left join event_setting flight_offset
				on flight_offset.event = event.id
				and flight_offset.tag = 'flight_offset'

			left join category_setting no_codes
				on no_codes.category = category.id
				and no_codes.tag = 'no_codes'

		where 1=1
			and round.id = :roundId
			and event.id = round.event
			and category.id = event.category
			and round.published > 0
			and round.timeslot = timeslot.id

	`, {
		replacements : {
			roundId,
		},
		type: db.Sequelize.QueryTypes.SELECT,
	});

	if (rounds.length > 0) {

		const round = rounds[0];

		if (round.published == 1) {
			round.published = 'full';
		} else if (round.published == 2) {
			round.published = 'noJudges';
		} else if (round.published == 3) {
			round.published = 'entryList';
		} else if (round.published == 4) {
			// THERE IS NO NUMBER FOUR
		} else if (round.published == 5) {
			round.published = 'chambers';
		} else {
			return;
		}

		['post_primary', 'post_secondary'].forEach( (tag) => {
			if (round[tag] == 3) {
				round[tag] = 'public';
			} else {
				delete round[tag];
			}
		});

		if (!round.startTime) {
			round.startTime = round.timeslotStartTime;
		}

		delete round.timeslotStartTime;

		if (round.tag === 'elim' || round.tag === 'final' || round.tag === 'runoff') {
			round.decisionDeadline = round.elimDecisionDeadline;
			round.tag = 'elim';
		} else {
			round.decisionDeadline = round.prelimDecisionDeadline;
			round.tag = 'prelim';
		}

		if (round.flighted === 1) {
			delete round.flighted;
		}

		if (!round.motionPublished) {
			delete round.motion;
		}

		delete round.motionPublished;
		delete round.elimDecisionDeadline;
		delete round.prelimDecisionDeadline;

		if (round.label === '' || round.label.isNull) {
			delete round.label;
		}

		return round;
	}
};

const getSectionsByRound = async (roundId) => {

	let sections = await db.sequelize.query(`
		select

			panel.id,
			panel.letter, panel.flight, panel.bye,
			room.id roomId, room.name roomName, room.url roomUrl, room.notes roomNotes,

			ballot.side, ballot.speakerorder, ballot.chair,

			entry.id entryId, entry.code entryCode, entry.name entryName,
			entry.school entrySchoolId,

			judge.id judgeId, judge.first judgeFirst, judge.last judgeLast,
			judge.code judgeCode,
			judge.school judgeSchoolId

		from (panel, ballot, entry)

			left join room on panel.room = room.id
			left join judge on ballot.judge = judge.id

		where 1=1

			and panel.round = :roundId
			and panel.id = ballot.panel
			and ballot.entry = entry.id

		order by panel.letter, ballot.side, ballot.speakerorder
	`, {
		replacements : { roundId },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	return sections;
};
