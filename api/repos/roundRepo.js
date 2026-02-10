import db from '../data/db.js';
import  { FIELD_MAP, toDomain, toPersistence } from './mappers/roundMapper.js';
import { eventInclude } from './eventRepo.js';
import { withSettingsInclude } from './utils/settings.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { sectionInclude } from './sectionRepo.js';

function buildRoundQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};

	if(!opts.unpublished){
		query.where.published = 1;
	}

	query.include.push(
		...withSettingsInclude({
			model: db.roundSetting,
			as: 'round_settings',
			settings: opts.settings,
		})
	);

	if (opts.include?.event) {
		const eventOpts =
			opts.include.event === true
				? { fields: ['id','name','abbr','type','level'], settings: [] }
				: opts.include.event;

		query.include.push({
			...eventInclude({
				...eventOpts,
			}),
			as: 'event_event',
		});
	}
	if(opts.include?.sections){
		query.include.push({
			...sectionInclude(opts.include.sections),
		});
	}

	return query;
}

export function roundInclude(opts = {}) {
	return {
		model: db.round,
		as: 'rounds',
		...buildRoundQuery(opts),
	};
}

//TODO remove
export async function getRound(roundId){
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
 */
export async function getRounds(scope = {}, opts = {}) {
	const query = buildRoundQuery(opts);

	if (scope.eventId) {
		query.where.event = scope.eventId;
	}

	if (scope.tournId) {
		// Try to find an existing event include
		let eventIncIdx = query.include.findIndex(i => i.as === 'event_event');

		// If it doesn't exist, add a JOIN-ONLY include
		if (eventIncIdx === -1) {
			query.include.push({
				model: db.event,
				as: 'event_event',
				attributes: [], // join-only include
				required: true,
				where: { tourn: scope.tournId },
			});
		} else {
			// Enforce scope
			query.include[eventIncIdx] = {
				...query.include[eventIncIdx],
				required: true,
				where: {
					...(query.include[eventIncIdx].where || {}),
					tourn: scope.tournId,
				},
			};
		}
	}

	const rounds = await db.round.findAll(query);
	return rounds.map(toDomain);
}

//TODO remove
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

async function createRound(data){
	const dbRow = await db.round.create(toPersistence(data));
	return dbRow.id;
}

export default {
	getRound,
	getRounds,
	createRound,
	getSections,
};