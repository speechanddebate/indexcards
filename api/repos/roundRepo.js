import db from '../data/db.js';
import  { mapEvent } from './eventRepo.js';
export async function getRoundById(roundId){
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

/**
 * Fetches rounds from the database with optional filters and event information.
 *
 * @param {Object} params - The options for fetching rounds.
 * @param {number} params.tournId - The ID of the tournament. Required if filtering by tournament.
 * @param {number} [params.eventId] - Optional ID of a specific event to filter rounds by.
 * @param {boolean} [params.unpublished=false] - Whether to include unpublished rounds. Defaults to false (only published rounds).
 * @param {boolean|Object} [params.includeEvent=false] - Whether to include event data with each round.
 *   Can be:
 *     - `false` (default) – do not include event info,
 *     - `true` – include default event fields (`id`, `name`, `abbr`, `type`, `level`),
 *     - an object with options:
 *         @property {string[]} [fields] - Event fields to include.
 *         @property {string[]} [settings] - Array of event_setting tags to include.
 *
 * @returns {Promise<Array<Object>>} An array of mapped round objects, each optionally containing event info and event settings.
 *
 * @example
 * const rounds = await getRounds({
 *   tournId: 12345,
 *   includeEvent: {
 *     fields: ['id','name','abbr','level'],
 *     settings: ['nsda_event_category']
 *   }
 * });
 * console.log(rounds[0].event.settings.nsda_event_category);
 */
export async function getRounds({
	tournId,
	eventId,
	unpublished = false,
	includeEvent = false,
}) {

	// Normalize includeEvent
	if (includeEvent === true) {
		includeEvent = {
			fields: ['id','name','abbr','type','level'],
			settings: [],
		};
	}

	const where = {

	};
	const include = [];

	if (!unpublished) {
		where.published = 1;
	}
	if (eventId) {
		where.event = eventId;
	}

	// Only include event join if tournId filter or we want to include event fields
	if (tournId || includeEvent) {
		const eventInclude = {
			model: db.event,
			as: 'event_event',
			...(tournId ? { where: { tourn: tournId } } : {}), // filter by tournId if given
			attributes: includeEvent ? includeEvent.fields : [], // use fields only if includeEvent
		};

		// Optionally include event settings if requested
		if (includeEvent?.settings?.length) {
			eventInclude.include = [
				{
					model: db.eventSetting,
					as: 'event_settings',
					required: false,
					where: { tag: includeEvent.settings },
					attributes: ['tag', 'value'],
				},
			];
		}
		include.push(eventInclude);
	}

	const rounds = await db.round.findAll({
		where: where,
		include,
	});

	return rounds.map(mapRound);
}
export async function getSections(roundId){
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
}

function mapRound(round) {
	if (!round) return null;

	const mapped = {
		id: round.id,
		type: round.type,
		name: round.name,
		label: round.label,
		flighted: round.flighted,
		postPrimary: round.postPrimary,
		postSecondary: round.postSecondary,
		postFeedback: round.postFeedback,
		published: round.published,
		eventId: round.event,
		event: mapEvent(round.event_event),
	};
	return mapped;
}

export default {
	getRoundById,
	getRounds,
	getSections,
};