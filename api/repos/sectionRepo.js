import db from '../data/db.js';
import { FIELD_MAP,toDomain, toPersistence } from './mappers/sectionMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { ballotInclude } from './ballotRepo.js';
import { roundInclude } from './roundRepo.js';
import { withSettingsInclude } from './utils/settings.js';

function buildSectionQuery(opts = {}){
	const query  = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields,FIELD_MAP),
		include: [],
	};

	if(opts.include?.Ballots){
		query.include.push({
			...ballotInclude(opts.include.Ballots),
			as: 'ballots',
			required: false,
		});
	}
	if(opts.include?.Round) {
		query.include.push({
			...roundInclude(opts.include.Round),
			as: 'round_round',
			required: opts.include.Round.required ?? false,
		});
	}
	query.include.push(
		...withSettingsInclude({
			model: db.panelSetting,
			as: 'panel_settings',
			settings: opts.settings,
		})
	);

	return query;
}

export function sectionInclude(opts = {}){
	return {
		model: db.panel,
		as: 'panels',
		...buildSectionQuery(opts),
	};
}

async function getSection(id, opts = {}){
	if (!id) throw new Error('getSection: id is required');
	const query = buildSectionQuery(opts);
	query.where.id = id;
	const section = await db.panel.findOne(query);
	return toDomain(section);
}

async function getSections(scope = {}, opts = {}) {
	const query = buildSectionQuery(opts);
	if (scope?.roundId) {
		query.where = { ...query.where, round: scope.roundId };
	}
	const sections = await db.panel.findAll(query);
	return sections.map(toDomain);
}

async function createSection(data){
	const section = await db.panel.create(toPersistence(data));
	return section.id;
}

async function updateSection(id, data){
	if (!id) throw new Error('updateSection: id is required');
	const [rows] = await db.panel.update(toPersistence(data), { where: { id } });
	return rows > 0;
}

async function deleteSection(id){
	if (!id) throw new Error('deleteSection: id is required');
	const rows = await db.panel.destroy({ where: { id } });
	return rows > 0;

}

async function getCurrentBallots(personId){
	const rows = await db.sequelize.query(`
select
judge.id judgeId,
judge.code judgeCode,
judge.first judgeFirst, 
judge.last judgeLast,
judge.obligation judgeObligation,
judge.hired judgeHired,
category.id categoryId, category.name categoryName, category.abbr categoryAbbr,
event.id eventId, event.name eventName, event.abbr eventAbbr, event.type eventType,
round.id roundId, round.name roundName, round.label roundLabel, round.published roundPublished, round.flighted roundFlighted, round.type roundType, round.start_time roundStart,
timeslot.start timeslotStart,
timeslot.end timeslotEnd,
panel.id panelId, panel.letter panelLetter, panel.flight panelFlight,
ballot.id ballotId, ballot.side ballotSide, ballot.speakerorder ballotSpeakerOrder, ballot.audit ballotAudit, ballot.judge_started ballotJudgeStarted, ballot.chair ballotChair,
entry.id entryId, entry.code entryCode,
room.id roomId, room.name roomName, room.url roomUrl, room.notes roomNotes,
online_mode.value onlineMode,
use_normal_rooms.value useNormalRooms,
online_ballots.value onlineBallots,
judges_ballots_visible.value judgesBallotsVisible,
aff_label.value affLabel,
neg_label.value negLabel,
legion.value legion,
service_project.value_text serviceProject,
mock_trial.value mockTrial,
include_room_notes.value includeRoomNotes,
flight_offset.value flightOffset,
(select es.value from event_setting es where es.event = event.id AND es.tag = 'start_button') AS startButton,
(select es.value from event_setting es where es.event = event.id AND es.tag = 'start_button_text') AS startButtonText,
sidelock_elims.value sidelockElims,
no_side_constraints.value noSideConstraints,
async.value asyncValue,
person.tz personTz,
tourn.id tournId, tourn.name tournName, tourn.tz tournTz, tourn.hidden tournHidden, tourn.end tournEnd,
score.id scoreId, permission.chapter permissionChapter, school.id schoolId, school.name schoolName,
rounds_per.value roundsPer,
flip_status.value flipStatus
from (judge, category, event, round, panel, ballot, entry, tourn, timeslot, person)

left join school on judge.school = school.id

left join permission on permission.person = judge.person
and permission.tag = 'chapter'
and permission.chapter = school.chapter

left join category_setting rounds_per
on rounds_per.category = category.id
and rounds_per.tag = 'rounds_per'

left join room on panel.room = room.id

left join score on score.ballot = ballot.id
and score.tag in ('winloss', 'rank', 'point', 'refute')

left join event_setting flight_offset
on flight_offset.event = event.id
and flight_offset.tag = 'flight_offset'

left join event_setting sidelock_elims
on sidelock_elims.event = event.id
and sidelock_elims.tag = 'sidelock_elims'

left join event_setting no_side_constraints
on no_side_constraints.event = event.id
and no_side_constraints.tag = 'no_side_constraints'

left join round_setting use_normal_rooms
on use_normal_rooms.round = round.id
and use_normal_rooms.tag = 'use_normal_rooms'

left join event_setting online_mode
on online_mode.event = event.id
and online_mode.tag = 'online_mode'

left join event_setting online_ballots
on online_ballots.event = event.id
and online_ballots.tag = 'online_ballots'

left join event_setting aff_label
on aff_label.event = event.id
and aff_label.tag = 'aff_label'

left join event_setting neg_label
on neg_label.event = event.id
and neg_label.tag = 'neg_label'

left join tourn_setting legion
on legion.tourn = tourn.id
and legion.tag = 'legion'

left join tourn_setting service_project
on service_project.tourn = tourn.id
and service_project.tag = 'service_project'

left join tourn_setting mock_trial
on mock_trial.tourn = tourn.id
and mock_trial.tag = 'mock_trial_registration'

left join round_setting judges_ballots_visible
on judges_ballots_visible.round = round.id
and judges_ballots_visible.tag = 'judges_ballots_visible'

left join round_setting include_room_notes
on include_room_notes.round = round.id
and include_room_notes.tag = 'include_room_notes'

left join panel_setting flip_status
on flip_status.panel = panel.id
and flip_status.tag = 'flip_status'

left join panel_setting async
on async.panel = panel.id
and async.tag = 'show_async'

where judge.person = :personId
and tourn.end >= now()
and judge.person = person.id
and judge.category = category.id
and category.tourn = tourn.id

and judge.id       = ballot.judge
and ballot.entry   = entry.id
and entry.active   = 1
and ballot.panel   = panel.id
and panel.round    = round.id
and round.event    = event.id
and round.timeslot = timeslot.id

group by panel.id, judge.id, ballot.entry
order by timeslot.start, event.abbr, round.name, panel.flight, ballot.audit
`, {
		type: db.Sequelize.QueryTypes.SELECT,
		replacements: { personId },
	});

	const panels = new Map();
	rows.forEach(row => {
		let panel = panels.get(row.panelId);
		if (!panel) {
			panel = {
				id: row.panelId,
				letter: row.panelLetter,
				flight: row.panelFlight,
				settings: {
					flip_status: row.flipStatus,
					show_async: row.asyncValue,
				},
				Judge: {
					id: row.judgeId,
					code: row.judgeCode,
					first: row.judgeFirst,
					last: row.judgeLast,
					obligation: row.judgeObligation,
					hired: row.judgeHired,
					Category: {
						id: row.categoryId,
						name: row.categoryName,
						abbr: row.categoryAbbr,
						Tourn: {
							id: row.tournId,
							name: row.tournName,
							tz: row.tournTz,
							hidden: row.tournHidden,
							end: row.tournEnd,
							settings: {
								legion: row.legion,
							},
						},
						Event: {
							id: row.eventId,
							name: row.eventName,
							abbr: row.eventAbbr,
							type: row.eventType,
							settings: {
								online_mode: row.onlineMode,
								start_button: row.startButton,
								start_button_text: row.startButtonText,
								flight_offset: row.flightOffset,
							},
						},
					},
				},
				Round: {
					id: row.roundId,
					name: row.roundName,
					label: row.roundLabel,
					published: row.roundPublished === 1,
					flighted: row.roundFlighted,
					type: row.roundType,
					start: row.roundStart,
					settings: {
						judges_ballots_visible: row.judgesBallotsVisible === '1',
					},
					Timeslot: {
						start: row.timeslotStart,
						end: row.timeslotEnd,
					},
				},
				Room: {
					id: row.roomId,
					name: row.roomName,
					notes: row.roomNotes,
					url: row.roomUrl,
				},
				Ballots: [],
				Entries: [],
			};
			panels.set(row.panelId, panel);
		};
		panel.Ballots.push({
			id: row.ballotId,
			side: row.ballotSide,
			speakerOrder: row.ballotSpeakerOrder,
			audit: row.ballotAudit,
			judge_started: row.ballotJudgeStarted,
			chair: row.ballotChair,
		});
		panel.Entries.push({
			id: row.entryId,
			code: row.entryCode,
		});
	});
	return [...panels.values()];
}
export default {
	getSection,
	getSections,
	updateSection,
	createSection,
	deleteSection,
	getCurrentBallots,
};
