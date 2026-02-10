import { getRoundAvailableJudges, getRoundJudgeConflicts } from '../round/judges.js';
import { getSectionEntries } from './entries.js';
import db from '../../../data/db.js';

export async function getSectionCleanJudges(req, res) {
	const section = await db.summon(db.section, req.params.sectionId);

	// Pull settings and everything else we need about this round
	section.round = await roundData(section.round);

	// Rather than triplicate code I'm calling the functions embedded with a flag
	// to return instead of outputting.  I'm sure some Express purist somewhere just
	// broke out in hives.  I'm equally sure I do not care.
	req.return = true;

	// Get the information and relevant data about the entries in my section
	section.entries = await getSectionEntries(req, res);

	// Pull the judges who are available to judge this round timewise
	req.round = section.round;
	section.round.judges = await getRoundAvailableJudges(req, res);

	// Pull the entry constraints against juges
	const judgeConflicts = await getRoundJudgeConflicts(req, res);

	const cleanJudges = section.round.judges.filter( (judge) => {
		if (judgeConflicts[judge.id]
			&& section.entries.Entries.some( entry => judgeConflicts[judge.id].indexOf(entry.id) !== -1)
		) {
			return false;
		}
		return judge;
	});

	if (req.return) {
		return cleanJudges;
	}

	res.status(200).json(cleanJudges);
};

const roundData = async (roundId) => {

	const [round] = await db.sequelize.query(`
		select
			round.id id, round.type type, round.timeslot timeslot,
			event.id event, event.type eventType,
			category.id category,
			jpool.id jpool,
			neutrals.value neutrals,
			auto_conflict_hires.value auto_conflict_hires,
			no_first_years.value no_first_years,
			allow_school_panels.value allow_school_panels,
			allow_region_panels.value allow_region_panels,
			region_judge_forbid.value region_judge_forbidid,
			conflict_dioregion_judges.value conflict_dioregion_judges,
			diocese_regions.value_text diocese_regions,
			allow_repeat_judging.value allow_repeat_judging,
			allow_repeat_elims.value allow_repeat_elims,
			allow_repeat_prelim_side.value allow_repeat_prelim_side,
			disallow_repeat_drop.value disallow_repeat_drop,
			online_mode.value online_mode,
			dumb_half_async_thing.value dumb_async,
			prefs.value prefs,
			tab_ratings.value tabRatings,
			timeslot.start start,
			timeslot.end end

		from (round, event, category, timeslot)

			left join category_setting tab_ratings
				on tab_ratings.category = category.id
				and tab_ratings.tag = "tab_ratings"

			left join category_setting prefs
				on prefs.category = category.id
				and prefs.tag = "prefs"

			left join category_setting neutrals
				on neutrals.category = category.id
				and neutrals.tag = "neutrals"

			left join category_setting auto_conflict_hires
				on auto_conflict_hires.category = category.id
				and auto_conflict_hires.tag = "auto_conflict_hires"

			left join category_setting allow_school_panels
				on allow_school_panels.category = category.id
				and allow_school_panels.tag = "allow_school_panels"

			left join category_setting allow_region_panels
				on allow_region_panels.category = category.id
				and allow_region_panels.tag = "allow_region_panels"

			left join event_setting no_first_years
				on no_first_years.event = event.id
				and no_first_years.tag = "no_first_years"

			left join event_setting region_judge_forbid
				on region_judge_forbid.event = event.id
				and region_judge_forbid.tag = "region_judge_forbid"

			left join event_setting conflict_dioregion_judges
				on conflict_dioregion_judges.event = event.id
				and conflict_dioregion_judges.tag = "conflict_dioregion_judges"

			left join event_setting diocese_regions
				on diocese_regions.event = event.id
				and diocese_regions.tag = "diocese_regions"

			left join event_setting allow_repeat_judging
				on allow_repeat_judging.event = event.id
				and allow_repeat_judging.tag = "allow_repeat_judging"

			left join event_setting allow_repeat_elims
				on allow_repeat_elims.event = event.id
				and allow_repeat_elims.tag = "allow_repeat_elims"

			left join event_setting allow_repeat_prelim_side
				on allow_repeat_prelim_side.event = event.id
				and allow_repeat_prelim_side.tag = "allow_repeat_prelim_side"

			left join event_setting disallow_repeat_drop
				on disallow_repeat_drop.event = event.id
				and disallow_repeat_drop.tag = "disallow_repeat_drop"

			left join event_setting online_mode
				on online_mode.event = event.id
				and online_mode.tag = "online_mode"

			left join event_setting dumb_half_async_thing
				on dumb_half_async_thing.event = event.id
				and dumb_half_async_thing.tag = "dumb_half_async_thing"

			left join jpool_round jpr on jpr.round = round.id
			left join jpool on jpr.jpool = jpool.id

		where round.id = :roundId
			and round.event = event.id
			and event.category = category.id
			and round.timeslot = timeslot.id
	`, {
		replacements: { roundId },
		type: db.sequelize.QueryTypes.SELECT,
	});

	if (round.conflict_dioregion_judges && round.diocese_regions) {
		round.dioregions = JSON.parse(round.diocese_regions);
	}

	if (round.type === 'final' || round.type === 'runoff') {
		round.type = 'elim';
	} else {
		round.type = 'prelim';
	}

	return round;
};
