export const roundAvailableJudges = {

	GET:  async (req, res) => {

		// Returns a list of judges who can judge this round, filtering out any
		// judge currently judging a non-async round, with a time constraint, or
		// those blocked against the event.

		// This should be the only time I actually resort to the adaptive sql
		// nonsense approach that the predecessor of this code did most foully, but
		// in this case it truly is the most efficient way to do things, both in
		// terms of code density and execution speed. I'm sorry.  I really am.
		// -- CLP

		const db = req.db;

		let round = {};

		if (req.round) {
			round = req.round;
		} else {
			round = await db.summon(db.round, req.params.roundId);
		}

		let judgeQuery = `
			select
				judge.id, judge.first, judge.middle, judge.last, judge.code,
				judge.hired, judge.obligation,
				judge.person, judge.school school, region.id region, district.id district,
				tab_rating.value tab_rating, chapter.state state, neutral.value neutral
		`;

		if (round.jpool) {
			// Pull judges from the judge pools linked to this round
			judgeQuery = ` ${judgeQuery}
				from (judge, jpool_judge jpj, jpool_round jpr, round, timeslot)
					left join school on judge.school = school.id
					left join region on school.region = region.id
					left join district on school.district = district.id
					left join chapter on school.chapter = chapter.id
					left join judge_setting tab_rating on tab_rating.tag = 'tab_rating' and tab_rating.judge = judge.id
					left join judge_setting neutral on neutral.tag = 'neutral' and neutral.judge = judge.id
				where jpr.round = :roundId
					and jpr.jpool = jpj.jpool
					and jpj.judge = judge.id
					and judge.active = 1
					and jpr.round = round.id
					and round.timeslot = timeslot.id
			`;
		} else {

			// Pull judges from the judge category linked to this round
			judgeQuery = ` ${judgeQuery}
				from (judge, round, event, timeslot)
					left join school on judge.school = school.id
					left join region on school.region = region.id
					left join district on school.district = district.id
					left join chapter on school.chapter = chapter.id
					left join judge_setting tab_rating on tab_rating.tag = 'tab_rating' and tab_rating.judge = judge.id
					left join judge_setting neutral on neutral.tag = 'neutral' and neutral.judge = judge.id
				where judge.active = 1
					AND (judge.category = event.category OR judge.alt_category = event.category)
					and event.id = round.event
					AND round.id = :roundId
					and round.timeslot = timeslot.id
			`;
		}

		// No event constraints please.
		judgeQuery = ` ${judgeQuery}
			and not exists (
				select evs.id
					from strike evs
				where evs.event = round.event
					and evs.judge = judge.id
					and evs.type = 'event'
			) `;

		// No elim constrained judges if we're not an elim.
		if (round.type === 'prelim') {
			judgeQuery = ` ${judgeQuery}
				and not exists (
					select els.id
						from strike els
					where els.event = round.event
						and els.type = 'elim'
						and els.judge = judge.id
				) `;
		}

		// No FYOs if we don't allow them
		if (round.no_first_years) {
			judgeQuery = ` ${judgeQuery}
				and not exists (
					select first_year.id
					from judge_setting first_year
					where first_year.tag = 'first_year'
					and first_year.judge = judge.id
				) `;
		}

		if (round.online_mode !== 'async') {
			// No time constraints that cover the present
			judgeQuery = ` ${judgeQuery}
				and not exists (
					select strike.id
						from strike
					where strike.type IN ('time', 'departure')
						and strike.start < timeslot.end
						and strike.end > timeslot.start
						and strike.judge = judge.id
				)
			`;
		}

		const initialJudges = await db.sequelize.query(judgeQuery, {
			replacements: { roundId: round.id },
			type: db.sequelize.QueryTypes.SELECT,
		});

		let busyQuery = `
			select
				judge.id, judge.person
			from judge, ballot, panel, round, timeslot, timeslot t2

				where judge.id = ballot.judge
					and ballot.panel = panel.id
					and panel.round = round.id
					and round.timeslot = timeslot.id
					and timeslot.tourn = t2.tourn
					and t2.id = :timeslotId
					and not exists (
						select es.id
						from event_setting es
						where es.event = round.event
						and es.tag = 'online_mode'
						and es.value = 'async'
					)
		`;

		if (round.no_back_to_back) {
			busyQuery = ` ${busyQuery}
				and t2.start <= timeslot.end
				and t2.end >= timeslot.start
			`;
		} else {
			busyQuery = ` ${busyQuery}
				and t2.start < timeslot.end
				and t2.end > timeslot.start
			`;
		}

		const busyFolks = await db.sequelize.query(busyQuery, {
			replacements: { timeslotId: round.timeslot },
			type: db.sequelize.QueryTypes.SELECT,
		});

		const busyJudges = {};
		const busyPeople = {};

		busyFolks.forEach( (folk) => {
			if (folk.judge) {
				busyJudges[folk.judge] = true;
			}
			if (folk.person) {
				busyPeople[folk.person] = true;
			}
		});

		const judges = [];

		initialJudges.forEach( (judge) => {
			if (busyJudges[judge.id]) {
				return;
			}
			if (judge.person && busyPeople[judge.person]) {
				return;
			}
			judges.push(judge);
		});

		if (req.return) {
			return judges;
		}

		res.status(200).json(judges);

	},
};

export const roundJudgeConflicts = {

	GET : async (req, res) => {
		const db = req.db;

		let round = {};

		if (req.round) {
			round = req.round;
		} else {
			round = await db.summon(db.round, req.params.roundId);
		}

		const judgeConflicts = {};

		const roundEntries = await db.sequelize.query(`
			select
				entry.id, school.id school, region.id region, district.id district, hybrid.school hybrid, ballot.side side
			from (entry, ballot, panel)
				left join school on entry.school = school.id
				left join region on school.region = region.id
				left join district on school.district = district.id
				left join strike hybrid on hybrid.type = 'hybrid' and hybrid.entry = entry.id
			where entry.id = ballot.entry
				and ballot.panel = panel.id
				and panel.round = :roundId
		`, {
			replacements: { roundId: round.id },
			type: db.sequelize.QueryTypes.SELECT,
		});

		const entriesBy    = {};

		entriesBy.school   = {};
		entriesBy.region   = {};
		entriesBy.dioregion   = {};
		entriesBy.district = {};
		entriesBy.side     = {};

		roundEntries.forEach( (entry) => {

			if (entry.school) {
				entriesBy.school[entry.school] = [entry.id, ...entriesBy.school[entry.school] ?? []];
			}

			if (entry.hybrid) {
				entriesBy.school[entry.hybrid] = [entry.id, ...entriesBy.school[entry.hybrid] ?? []];
			}

			if (round.conflict_dioregion_judges && round.dioregions[entry.region]) {
				entry.dioregion = round.dioregions[entry.region];
				entriesBy.dioregion[entry.dioregion] = [
					entry.id,
					...entriesBy.dioregion[entry.dioregion] ?? [],
				];
			}

			if (entry.region) {
				entriesBy.region[entry.region] = [entry.id, ...entriesBy.region[entry.region] ?? []];
			}

			if (entry.district) {
				entriesBy.district[entry.district] = [
					entry.id,
					...entriesBy.district[entry.district] ?? [],
				];
			}

			if (entry.side) {
				entriesBy.side[entry.id] = entry.side;
			}
		});

		if (!round.allow_repeat_judging) {
			const ballotConflicts = await db.sequelize.query(`
				select
					entry.id entry, ballot.judge, ballot.side, winloss.id winloss, winloss.value winner
				from (entry, ballot, panel, round)
					left join score winloss on winloss.tag = 'winloss' and winloss.ballot = ballot.id
				where exists (
						select b1.id
						from ballot b1, panel p1
						where b1.entry = entry.id
						and b1.panel = p1.id
						and p1.round = :roundId
					)
					and entry.id = ballot.entry
					and ballot.panel = panel.id
					and panel.round != :roundId
					and panel.round = round.id
					and ballot.judge > 0
			`, {
				replacements: { roundId: round.id },
				type: db.sequelize.QueryTypes.SELECT,
			});

			ballotConflicts.forEach( (ballot) => {

				if (!judgeConflicts[ballot.judge]) {
					judgeConflicts[ballot.judge] = [];
				}

				if (round.type === 'elim') {
					if (round.allow_repeat_elims) {
						if (!round.disallow_repeat_drop
							|| ballot.winner
						) {
							// No conflict because either I won or it doesn't matter
							return;
						}
					}
					judgeConflicts[ballot.judge] = [ballot.entry, ...judgeConflicts[ballot.judge] ?? []];
				} else {
					if (round.allow_repeat_prelim_side && entriesBy.side[ballot.entry] === ballot.side) {
						judgeConflicts[ballot.judge].push(ballot.entry);
					} else if (!round.allow_repeat_prelim_side) {
						judgeConflicts[ballot.judge].push(ballot.entry);
					}
				}
			});
		}

		// Process any entry, school, region or district strikes against the judges available
		let judgeStrikesQuery = `
			select
				judge.id judge, strike.type, strike.entry, strike.school, strike.district, strike.region
		`;

		if (round.jpool) {
			// Pull judges from the judge pools linked to this round
			judgeStrikesQuery = ` ${judgeStrikesQuery}
				from (judge, jpool_judge jpj, jpool_round jpr, strike)
				where judge.id = strike.judge
					and jpj.judge = judge.id
					and jpr.round = :roundId
					and jpr.jpool = jpj.jpool
					and judge.active = 1
			`;
		} else {
			// Pull judges from the judge category linked to this round
			judgeStrikesQuery = ` ${judgeStrikesQuery}
				from (judge, strike, round, event)
				where judge.id = strike.judge
					and round.id = :roundId
					and round.event = event.id
					and event.category = judge.category
					and judge.active = 1
			`;
		}

		const judgeStrikes = await db.sequelize.query(
			judgeStrikesQuery,{
				replacements: { roundId: round.id },
				type: db.sequelize.QueryTypes.SELECT,
			});

		judgeStrikes.forEach( (strike) => {

			if (!judgeConflicts[strike.judge]) {
				judgeConflicts[strike.judge] = [];
			}

			if (strike.type === 'school' && entriesBy.school[strike.school]) {
				judgeConflicts[strike.judge] = [
					...entriesBy.school[strike.school],
					...judgeConflicts[strike.judge] ?? [],
				];

			} else if (strike.type === 'region' && entriesBy.region[strike.region]) {
				judgeConflicts[strike.judge] = [
					...entriesBy.region[strike.region],
					...judgeConflicts[strike.judge] ?? [],
				];

			} else if (strike.type === 'district' && entriesBy.district[strike.district]) {
				judgeConflicts[strike.judge] = [
					...entriesBy.district[strike.district],
					...judgeConflicts[strike.judge] ?? [],
				];
			} else if (strike.type === 'entry') {
				judgeConflicts[strike.judge] = [
					strike.entry,
					...judgeConflicts[strike.judge] ?? [],
				];
			}
		});

		if (round.auto_conflict_hires) {

			const judgeHires = await db.sequelize.query(`
				select judge_hire.judge, judge_hire.school
					from (judge_hire, school, entry, ballot, panel)
				where panel.round = :roundId
					and panel.id = ballot.panel
					and ballot.entry = entry.id
					and entry.school = school.id
					and school.id = judge_hire.school
				group by judge_hire.id
			`, {
				replacements: { roundId: round.id },
				type: db.sequelize.QueryTypes.SELECT,
			});

			judgeHires.forEach( (hire) => {
				if (!judgeConflicts[hire.judge]) {
					judgeConflicts[hire.judge] = [];
				}

				if (hire.school && entriesBy.school[hire.school]) {
					judgeConflicts[hire.judge] = [
						...entriesBy.school[hire.school],
						...judgeConflicts[hire.judge] ?? [],
					];
				}
			});
		}

		if (!round.allow_judge_own) {

			// Conflict any entries from one's own school if that's required.

			round.judges.forEach( (judge) => {

				if (judge.school && entriesBy.school[judge.school]) {
					judgeConflicts[judge.id] = [
						...entriesBy.school[judge.school],
						...judgeConflicts[judge.id] ?? [],
					];
				}

				if (round.region_judge_forbid && judge.school && entriesBy.school[judge.school]) {
					judgeConflicts[judge.id] = [
						...entriesBy.region[judge.region],
						...judgeConflicts[judge.id] ?? [],
					];
				}

				if (round.conflict_dioregion_judges && round.dioregions[judge.region]) {
					judgeConflicts[judge.id] = [
						...entriesBy.dioregion[judge.dioregion],
						...judgeConflicts[judge.id] ?? [],
					];
				}
			});
		}

		if (req.return) {
			return judgeConflicts;
		}

		res.status(200).json(judgeConflicts);
	},
};

export default roundAvailableJudges;
