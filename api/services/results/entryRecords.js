/* This delivers the published record for a given entry */
import db from '../../data/db.js';

export const entryRecords = async (entryId, tournId, options) => {

	// This has to be filled in by whatever convoluted bullshit RT did to auth :)
	let postLevel = '3';
	if (options?.isCoach) postLevel = 1;
	if (options?.isEntry) postLevel = 2;

	const resultsData = await db.sequelize.query(`
		select
			entry.id, entry.code, entry.name,
			event.id eventId, event.name eventName, event.abbr eventAbbr, event.type eventType,
			round.id roundId, round.type roundType, round.name roundName, round.label roundLabel,
			room.id roomId, room.name roomName,
			round.published roundPublished,
			round.post_primary postPrimary,
			round.post_secondary postSecondary,
			judge.id judgeId, judge.first judgeFirst, judge.middle judgeMiddle, judge.last judgeLast,
			student.id studentId, student.first studentFirst, student.middle studentMiddle, student.last studentLast,
			section.id sectionId, section.publish sectionPublish, section.bye sectionBye,
			ballot.bye, ballot.forfeit, ballot.chair, ballot.side, ballot.speakerorder,
			score.id scoreId, score.tag scoreTag, score.value scoreValue,
			(select anon.value from event_setting anon where anon.event = event.id and anon.tag = 'anonymous_public') as anonymousPublic,
			(select al.value from event_setting al where al.event = event.id and al.tag = 'aff_label') as affLabel,
			(select nl.value from event_setting nl where nl.event = event.id and nl.tag = 'neg_label') as negLabel

		from (event, entry, round, panel section, ballot)

			left join score on score.ballot = ballot.id
			left join student on score.student = student.id
			left join judge on ballot.judge = judge.id
			left join room on section.room = room.id

		where 1=1

			and entry.id     = :entryId
			and entry.event  = event.id
			and event.tourn  = :tournId
			and event.id     = round.event
			and round.id     = section.round
			and section.id   = ballot.panel
			and ballot.entry = entry.id
			and (ballot.audit = 1 OR section.bye = 1)

			and NOT EXISTS (
				select rs.id from round_setting rs
				where rs.tag = 'ignore_results'
				and rs.round = round.id
			)

		order by round.name, ballot.chair DESC, ballot.id
	`, {
		type: db.Sequelize.QueryTypes.SELECT,
		replacements: { entryId, tournId },
	});

	if (resultsData
		&& resultsData[0]
		&& resultsData[0].anonymousPublic
		&! options?.inTournament // from auth
	) {
		return 401;
	}

	if (!resultsData || resultsData.length < 1) return 401;

	const records = {};

	resultsData.forEach( (row) => {

		if ( row.roundPublished !== 1
			&& (row.postPrimary || 0 < postLevel)
			&& !row.sectionPublish) return;

		if (!records.Entry) {

			records.Entry = {
				id           : row.id,
				code         : row.code,
				name         : row.name,
				side         : (row.side ? row.side == 1 ? row.affLabel || 'Aff' : row.negLabel || 'Neg' : ''),
				speakerorder : row.speakeroder,
			};

			records.Event = {
				id   : row.eventId,
				abbr : row.eventAbbr,
				name : row.eventName,
				type : row.eventType,
			};

			records.Rounds = {};
		}

		if (!records.Rounds[row.roundName]) {
			records.Rounds[row.roundName] = {
				id      : row.roundId,
				type    : row.roundType,
				Results : {},
			};

			if (row.roundLabel) records.Rounds[row.roundName].label = row.roundLabel;

			if (row.roomId) {
				records.Rounds[row.roundName].Room = {
					id   : row.roomId,
					name : row.roomName,
				};
			}
		}

		let results = records.Rounds[row.roundName].Results;

		if (row.postPrimary >= postLevel || row.sectionPublish) {

			if (!results.default)  results.default = {};
			if (row.sectionBye || row.bye) results.default.primary = 'BYE';
			if (row.forfeit) results.default.primary = 'FORFEIT';

			if (row.judgeId) {

				if (!results[row.judgeId]) {
					results[row.judgeId] = {
						chair      : row.chair ? true : false,
						id         : row.judgeId,
						name       : `${row.judgeLast}, ${row.judgeFirst}${row.judgeMiddle ? ` ${row.judgeMiddle}` : '' }`,
						primary    : '',
					};
				}

				if (row.scoreTag === 'winloss')  results[row.judgeId].primary = 'W';

				// Speech or Congress Ranks
				if (row.scoreTag === 'rank'
					&& (row.eventType === 'speech'
						|| row.eventType === 'congress'
						|| row.eventType === 'wudc'
					)
				) {
					results[row.judgeId].primary = row.scoreValue;
				}
			}
		}

		if (row.postSecondary >= postLevel) {
			if (row.judgeId) {

				if (
					row.scoreTag === 'point'
					|| row.scoreTag === 'refute'
					|| (row.scoreTag === 'rank'
						&& (row.eventType === 'debate'
							|| row.eventType === 'wsdc'
						)
					)
				) {

					if (row.studentId) {

						if (!results[row.judgeId].studentScores) results[row.judgeId].studentScores = {};

						if (!results[row.judgeId].studentScores[row.studentId]) {
							results[row.judgeId].studentScores[row.studentId] = {
								name   : `${row.studentLast}, ${row.studentFirst}${row.studentMiddle ? ` ${row.studentMiddle}` : '' }`,
								id     : row.studentId,
							};
						}

						results[row.judgeId].studentScores[row.studentId][row.scoreTag] = parseFloat(row.scoreValue);

					} else {

						if (row.scoreTag === 'point') {
							results[row.judgeId].teamPoints = parseFloat(row.scoreValue);
						}
					}
				}
			} else {

				if (row.scoreTag === 'point') {
					results[row.judgeId].teamPoints = parseFloat(row.scoreValue);
				}
				if (row.scoreTag === 'rank') {
					results[row.judgeId].teamRanks = parseFloat(row.scoreValue);
				}
			}
		}

		records.Rounds[row.roundName].Results = results;
	});

	return records;
};

export default {
	entryRecords,
};