/* Record Service calculates the win/loss record of entries given an eventID and and
 * optional round name delimiter (up to and including Round 4, eg).  It returns
 * an object of entryID keyed entry records. */
import db from '../../data/db.js';
import roundRepo from '../../repos/roundRepo.js';

export const entryRecords = async ({eventId, roundName, roundId, ...options}) => {

	// This has to be filled in by whatever convoluted bullshit RT did to auth :)
	let postLevel = '3';
	let publicLimiter = '';
	if (options.isCoach) postLevel = 1;
	if (options.isEntry) postLevel = 2;

	if (!options.admin) {
		publicLimiter = 'and round.post_primary = :postLevel';
	}

	if (roundId && !eventId) {
		const round = await roundRepo.getRound(roundId);
		eventId     = round.eventId;
		roundName   = round.name;
	}

	let roundNameLimiter = '';
	if (roundName) {
		// Always check as of the round before because the default expression
		// here is the "record going into this round" for schematics or
		// powermatching.
		roundNameLimiter = 'and round.name < :roundName';
	}

	const resultsData = await db.sequelize.query(`
		select
			entry.id, entry.code,
			round.id roundId, round.type roundType, round.name roundName,
			panel.bye panelBye,
			ballot.bye, ballot.forfeit, ballot.chair,
			winloss.id winlossExists,
			winloss.value winloss,
			( select bb.value
				from event_setting bb
				where bb.event = round.event
				and bb.tag = 'bracket_by_ballots'
			) as byBallots
		from (entry, round, panel, ballot)
			left join score winloss on winloss.ballot = ballot.id and winloss.tag = 'winloss'
		where 1=1
			and round.event = :eventId
			${ roundNameLimiter }
			${ publicLimiter }
			and round.id = panel.round
			and panel.id = ballot.panel
			and ballot.entry = entry.id
			and NOT EXISTS (
				select rs.id from round_setting rs
				where rs.tag = 'ignore_results'
				and rs.round = round.id
			)
	`, {
		type: db.Sequelize.QueryTypes.SELECT,
		replacements: {
			eventId,
			roundName,
			postLevel,
		},
	});

	// First aggregate the ballots by round so we can tell who won or lost a
	// given round because their ballot count is higher.  this is a silly step
	// for the ordinary case where there's just one judge, but necessary if
	// there is more than one.
	const recordByRound = {};

	resultsData.forEach( (entry) => {
		if (!recordByRound[entry.id]) {
			recordByRound[entry.id] = {
				code: entry.code,
				rounds: {},
			};
		}

		let record = recordByRound[entry.id].rounds[entry.roundId];

		if (!record) {
			record = {
				name         : entry.roundName,
				type         : entry.roundType,
				ballotWins   : 0,
				ballotLosses : 0,
				record       : '',
				bye          : false,
				forfeit      : false,
			};
		}

		// The affirmative existence of a score overrides even a bye/forfeit
		if (entry.winlossExists) {

			if (entry.winloss) {
				record.ballotWins++;
			} else {
				record.ballotLosses++;
			}

			if (entry.panelBye || entry.bye) record.bye = true;
			if (entry.forfeit) record.forfeit = true;

		} else {
			if (entry.panelBye || entry.bye) {
				record.bye = true;
				record.ballotWins++;
			} else {
				record.forfeit = true;
				record.ballotLosses++;
			}
		}

		recordByRound[entry.id].rounds[entry.roundId] = { ...record };
	});

	// Now process the aggregated per-round data into meaningful results for
	// the end users. It used to be options would give back different answers
	// but I think moving to a full object that can be parsed later is
	// healthier now.
	const entries = {};
	let splits = false;

	Object.keys(recordByRound).forEach( (entryId) => {

		const records = recordByRound[entryId];
		let entry = entries[entryId];

		if (!entry) {
			entry = {
				code         : records.code,
				wins         : 0,
				losses       : 0,
				splits       : 0,
				byes         : 0,
				forfeits     : 0,
				ballotWins   : 0,
				ballotLosses : 0,
				record       : '',  // 3-0, 4-2, etc
				prelim : {
					wins         : 0,
					losses       : 0,
					splits       : 0,
					ballotWins   : 0,
					ballotLosses : 0,
					record       : '',  // 3-0, 4-2, etc
				},
				elim : {
					wins         : 0,
					losses       : 0,
					splits       : 0,
					ballotWins   : 0,
					ballotLosses : 0,
					record       : '',  // 3-0, 4-2, etc
				},
			};
		}

		Object.keys(records.rounds).forEach((entryRoundId) => {

			const round = records.rounds[entryRoundId];
			let roundType = 'prelim';
			if (['final', 'elim', 'runoff'].includes(round.type)) roundType = 'elim';

			if (resultsData.byBallots) {

				entry.wins += round.ballotWins;
				entry.losses += round.ballotLosses;
				entry.ballotWins += round.ballotWins;
				entry.ballotLosses += round.ballotLosses;
				entry[roundType].wins += round.ballotWins;
				entry[roundType].losses += round.ballotLosses;
				entry[roundType].ballotWins += round.ballotWins;
				entry[roundType].ballotLosses += round.ballotLosses;

			} else {

				if (round.ballotWins > round.ballotLosses) {
					entry[roundType].wins++;
					entry.wins++;
				} else if (round.ballotWins === round.ballotLosses) {
					entry[roundType].splits++;
					entry.splits++;
					splits = true;
				} else {
					entry.losses++;
					entry[roundType].losses++;
				}

				if (round.bye) entry.bye++;
				if (round.forfeit) entry.forfeit++;

				entry.ballotWins += round.ballotWins;
				entry.ballotLosses += round.ballotLosses;
				entry[roundType].ballotWins += round.ballotWins;
				entry[roundType].ballotLosses += round.ballotLosses;
			}

		});
		// not necessary but makes it clearer this was intended
		entries[entryId] = entry;
	});

	// A bit stupid but I'd rather do this once here than sixty eight times in
	// front end code.

	Object.keys(recordByRound).forEach( (entryId) => {
		const entry = entries[entryId];

		entry.record = `${entry.wins}-`;
		entry.record += `${entry.losses}`;
		if (splits) entry.record += `${entry.splits}`;

		entry.prelim.record = `${entry.prelim.wins}-`;
		entry.prelim.record += `${entry.prelim.losses}`;
		if (splits) entry.prelim.record += `${entry.prelim.splits}`;

		entry.elim.record = `${entry.elim.wins}-`;
		entry.elim.record += `${entry.elim.losses}`;
		if (splits) entry.elim.record += `${entry.elim.splits}`;

		// not necessary but makes it clearer this was intended
		entries[entryId] = entry;
	});

	return entries;
};

export default {
	entryRecords,
};