import db from '../../../data/db.js';
import { NotFound } from '../../../helpers/problem.js';
import { dbToObject, stripNulls } from '../../../helpers/text.js';

export const getRoundResults = async (req,res) => {

	// Be agnostic about accepting round ID or the human interface stuff.
	let finderQuery = ` and round.id = :roundId `;

	if (!req.valid.params.roundId) {
		finderQuery =` and event.tourn = :tournId
			and event.abbr   = :eventAbbr
			and round.name   = :roundName `;
	}

	const rawBallots = await db.sequelize.query(`
		select
			round.id roundId, round.name roundName, round.label roundLabel,
			round.flighted roundFlighted,

			event.abbr eventAbbr, event.name eventName,
			event.type eventType, event.id eventId,

			(select maxEntry.value
				from event_setting maxEntry
				where maxEntry.tag = 'max_entry'
				and maxEntry.event = round.event
			) maxEntrySize,

			(select aff.value
				from event_setting aff
				where aff.tag = 'aff_label'
				and aff.event = round.event
			) affLabel,

			(select neg.value
				from event_setting neg
				where neg.tag = 'neg_label'
				and neg.event = round.event
			) negLabel,

			(select jpr.value
				from event_setting jpr
				where jpr.tag = 'judge_publish_results'
				and jpr.event = round.event
			) publishResults,

			round.post_primary postPrimary,
			round.post_secondary postSecondary,

			section.id sectionId, section.letter sectionLetter,
			section.bye sectionBye, section.flight,
			section.publish sectionPublished,
			ballot.id ballotId, ballot.bye ballotBye, ballot.forfeit ballotForfeit,
			ballot.side, ballot.speakerorder, ballot.chair judgeChair,
			judge.id judgeId, judge.first judgeFirst, judge.last judgeLast,
			entry.id entryId, entry.code entryCode, entry.name entryName,
			school.id schoolId, school.name schoolName

		from (panel as section, ballot, round, event)
			left join entry on entry.id = ballot.entry
			left join judge on judge.id = ballot.judge
			left join school on school.id = entry.school

		where 1=1
			${finderQuery}
			and round.published = 1
			and section.round   = round.id
			and section.id      = ballot.panel
			and round.event     = event.id
		order by section.bye, ballot.forfeit, ballot.bye, section.flight, judge.last
	`, {
		replacements: { ...req.valid.params },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	if (rawBallots.length < 1) 	return NotFound(req, res, 'No public results matching your search exist');

	let round = {};

	rawBallots.forEach( (ballot) => {

		if (!round.name) {

			round = dbToObject(ballot, 'round', { justTag: true});
			round.label = ballot.roundLabel || `Round ${ballot.roundName}`;

			// 3 for Posting means Public and this is a public only API so...
			if (ballot.postPrimary === 3) 		round.postPrimary   = true;
			if (ballot.postSecondary === 3) 	round.postSecondary = true;
			if (ballot.flighted) 				round.flighted      = ballot.flighted;

			round.Event = dbToObject(ballot, 'event', { justTag: true});
			round.Event.Settings = {
				affLabel       : ballot.affLabel || 'Aff',
				negLabel       : ballot.negLabel || 'Neg',
				publishResults : ballot.publishResults,
				maxEntrySize   : ballot.maxEntrySize,
			};

			delete ballot.affLabel;
			delete ballot.negLabel;
			delete ballot.publishResults;
			delete ballot.maxEntrySize;

			round.Sections = {};
			round.scoreTypes = {};
		}

		if (!round.Sections[ballot.sectionId]) {
			round.Sections[ballot.sectionId] = dbToObject(ballot, 'section', { justTag: true });
			round.Sections[ballot.sectionId].Judges  = {};
			round.Sections[ballot.sectionId].Entries = {};
		}

		const section = round.Sections[ballot.sectionId];

		if (ballot.judgeId && (!section.Judges[ballot.judgeId])) {
			section.Judges[ballot.judgeId] = dbToObject(ballot, 'judge', { justTag: true });
			delete section.Judges[ballot.judgeId].id;
		}

		const entryKey = ballot.side || ballot.speakerorder || ballot.entryId;

		if (ballot.entryId && (!section.Entries[entryKey])) {
			const entry = dbToObject(ballot, 'entry', {justTag: true});

			if (!section.bye) {
				if (parseInt(ballot.side) == 1) 	entry.side = round.Event.Settings.affLabel;
				if (parseInt(ballot.side) == 2) 	entry.side = round.Event.Settings.negLabel;
				if (ballot.speakerorder) 			entry.speakerorder = ballot.speakerorder;
			}

			if (ballot.schoolId) {
				entry.schoolId = ballot.schoolId;
				entry.schoolName = ballot.schoolName;
			}

			if (round.Event.Settings.maxEntrySize > 1) {
				entry.Speakers = {};
			}

			entry.Ballots = {};

			if (ballot.ballotBye) {
				entry.Ballots.bye = true;
			} else if (ballot.ballotForfeit) {
				entry.Ballots.forfeit = true;
			}
			section.Entries[entryKey] = entry;
		}
		round.Sections[ballot.sectionId] = section;
	});

	const rawScores = await db.sequelize.query(`
		select
			panel.id sectionId,
			score.tag, score.value, score.speech,
			ballot.entry entryId, ballot.judge judgeId,
			ballot.id ballotId, ballot.bye ballotBye, ballot.forfeit ballotForfeit,
			ballot.side, ballot.speakerorder,
			student.id studentId, student.first studentFirst, student.last studentLast
		from (ballot, panel, score)
			left join student on score.student = student.id
		where 1=1
			and panel.round = :roundId
			and panel.id = ballot.panel
			and ballot.id = score.ballot
			and score.tag IN ('winloss', 'rank', 'point', 'refute', 'po', 'speech')
	`,{
		replacements: { roundId: round.id },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	rawScores.forEach( (score) => {

		const section = round.Sections[score.sectionId];
		const entryKey = score.side || score.speakerorder || score.entryId;
		const entry = section.Entries[entryKey];

		// If there is a student make sure they exist in the Entry
		if (score.studentId && round.Event.Settings.maxEntrySize > 1) {
			if (!section.Entries[entryKey].Speakers[score.studentId]) {
				section.Entries[entryKey].Speakers[score.studentId] = dbToObject(score, 'student', { justTag: true });
			};
		}

		if (!entry.Ballots) entry.Ballots = {};
		if (!entry.Ballots[score.judgeId]) entry.Ballots[score.judgeId] = {};

		const ballot = entry.Ballots[score.judgeId];

		const winlossTypes = ['debate', 'wsdc', 'mockTrial'];
		const rankTypes    = ['speech', 'congress', 'wudc'];

		if (round.postPrimary
			|| (section.published && round.Event.Settings.publishResults)
		) {

			if (winlossTypes.includes(round.Event.type) && score.tag == 'winloss') {
				ballot.winloss = 'L';
				if (score.value > 0) 		ballot.winloss = 'W';
				if (score.ballotBye) 		ballot.winloss = 'Bye';
				if (score.ballotForfeit) 	ballot.winloss = 'Fft';
				round.Event.Settings.primaryScore = 'winloss';
				round.Event.Settings = stripNulls(round.Event.Settings);
				round.scoreTypes[score.tag] = true;
			}

			if (rankTypes.includes(round.Event.type) && score.tag == 'rank') {
				if (!ballot.rank)	ballot.rank = 0;
				ballot.rank += score.value;
				round.Event.Settings.primaryScore = 'rank';
				round.scoreTypes[score.tag] = true;
			}
		}

		if (round.postSecondary
			|| (section.published && round.Event.Settings.publishResults === 'all')
		) {

			if (
				(!winlossTypes.includes(round.Event.type) || score.tag !== 'winloss')
				&& (!rankTypes.includes(round.Event.type) || score.tag !== 'rank')
			) {
				round.scoreTypes[score.tag] = true;
				if (score.tag === 'refute') {
					if (!ballot['point'])  ballot['point'] = 0;
					ballot['point'] += score.value;
				} else if (score.tag === 'speech') {
					if (!ballot[score.tag]) {
						ballot[score.tag] = '';
					} else {
						ballot[score.tag] += ', ';
					}
					ballot[score.tag] += score.value;
				} else {
					if (!ballot[score.tag])  ballot[score.tag] = 0;
					ballot[score.tag] += score.value;
				}

				if (score.studentId && round.Event.Settings.maxEntrySize > 1) {
					if (!ballot.Speakers) ballot.Speakers = {};
					if (!ballot.Speakers[score.studentId]) ballot.Speakers[score.studentId] = {};
					ballot.Speakers[score.studentId][score.tag] = score.value;
				}
			}
		}

		entry.Ballots[score.judgeId]    = ballot;
		section.Entries[entryKey]       = entry;
		round.Sections[score.sectionId] = section;
	});

	return res.status(200).json(round);

};

export default {
	getRoundResults,
};