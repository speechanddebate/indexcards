/* This delivers the published record for a given entry */
import db from '../../data/db.js';
import { snakeToCamel } from '../../helpers/text.js';

export const entryRecords = async (entryId, tournId, options) => {

	// This has to be filled in by whatever convoluted bullshit RT did to auth :)
	let postLevel = '3';
	if (options?.isCoach) postLevel = 1;
	if (options?.isEntry) postLevel = 2;

	const resultsData = await db.sequelize.query(`
		select
			entry.id, entry.code, entry.name,
			event.id eventId, event.name eventName, event.abbr eventAbbr, event.type eventType, event.nsda_category nsdaCategory,
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

			(select mode.value
				from event_setting mode
				where mode.event = event.id
				and mode.tag = 'online_mode'
			) as onlineMode,

			(select primaryScore.value
				from event_setting primaryScore
				where primaryScore.event = event.id
				and primaryScore.tag = 'primary_score'
			) as primaryScore,

			(select anon.value
				from event_setting anon
				where anon.event = event.id
				and anon.tag = 'anonymous_public'
			) as anonymousPublic,

			(select al.value
				from event_setting al
				where al.event = event.id
				and al.tag = 'aff_label'
			) as affLabel,

			(select nl.value
				from event_setting nl
				where nl.event = event.id
				and nl.tag = 'neg_label'
			) as negLabel,

			(select
				oppballot.entry
				from ballot oppballot
				where oppballot.panel = section.id
				and oppballot.entry != entry.id
				limit 1
			) opponentId,
			(select
				opp.code
				from ballot oppballot, entry opp
				where oppballot.panel = section.id
				and oppballot.entry != entry.id
				and oppballot.entry = opp.id
				limit 1
			) opponentCode

		from (event, entry, round, panel section, ballot)

			left join score on score.ballot = ballot.id
				and score.tag IN ('point', 'rank', 'refute', 'winloss', 'po')
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

	let records = {};
	let primaryScore = '';

	resultsData.forEach( (row) => {

		if ( row.roundPublished !== 1
			&& (row.postPrimary || 0 < postLevel)
			&& !row.sectionPublish) return;

		if (!records?.id) {

			records = {
				id       : row.id,
				code     : row.code,
				name     : row.name,
				students : {},
			};

			records.Event = {
				id           : row.eventId,
				abbr         : row.eventAbbr,
				name         : row.eventName,
				nsda         : row.nsdaCategory,
				mode         : snakeToCamel(row.onlineMode),
				type         : snakeToCamel(row.eventType),
			};

			if (records.Event.type == 'mockTrial') {
				if (row.side === 1) records.sideLabel = row.affLabel || 'Pros';
				if (row.side === 2) records.sideLabel = row.negLabel || 'Def';
			}
			records.Rounds = {};
		}

		if (row.studentId && !records.students[row.studentId]) {
			records.students[row.studentId] = {
				name  : `${row.studentLast}, ${row.studentFirst}${row.studentMiddle ? ` ${row.studentMiddle}` : '' }`,
				label : `${row.studentLast}, ${row.studentFirst.substr(0, 1)}${row.studentMiddle ? row.studentMiddle.substr(0,1) : '' }`,
				last  : row.studentLast,
				first : row.studentFirst,
			};
		}

		if (!records.Event.scoreTags) records.Event.scoreTags = {};
		if (row.scoreTag && !records.Event.scoreTags[row.scoreTag]) records.Event.scoreTags[row.scoreTag] = true;

		if (!records.Rounds[row.roundName]) {
			records.Rounds[row.roundName] = {
				id           : row.roundId,
				type         : row.roundType,
				side         : row.side,
				sideLabel    : (row.side ? row.side == 1 ? row.affLabel || 'Aff' : row.negLabel || 'Neg' : ''),
				speakerorder : row.speakeroder,
				Results      : {},
				Judges       : {},
			};

			if (['debate', 'wsdc', 'mockTrial'].includes(row.eventType)) {
				records.Rounds[row.roundName].Opponent = {
					id   : row.opponentId,
					code : row.opponentCode,
				};
			}

			records.Rounds[row.roundName].label = row.roundLabel || `Round ${row.roundName}`;
			records.Rounds[row.roundName].name = row.roundName;

			if (row.roomId) {
				records.Rounds[row.roundName].Room = {
					id   : row.roomId,
					name : row.roomName,
				};
			}
		}

		let round = records.Rounds[row.roundName];
		let results = records.Rounds[row.roundName].Results;

		if (!round.Judges[row.judgeId]) {
			round.Judges[row.judgeId] = {
				name   : `${row.judgeLast}, ${row.judgeFirst}${row.judgeMiddle ? ` ${row.judgeMiddle}` : '' }`,
				first  : row.judgeFirst,
				last   : row.judgeLast,
			};
		}

		if (row.bye) records.Rounds[row.roundName].bye = true;

		if (row.postPrimary >= postLevel || row.sectionPublish) {

			if (row.sectionBye) records.Rounds[row.roundName].bye = true;
			if (row.forfeit) records.Rounds[row.roundName].forfeit = true;

			if (!results[row.judgeId]) {
				results[row.judgeId] = {
					chair      : row.chair ? true : false,
					id         : row.judgeId,
				};
			}

			// What is the primary score? If not set yet, then it should be the setting over all.
			if (!primaryScore && row.primaryScore) primaryScore = row.primaryScore;

			// If it is not set explicitly, then debate gets winloss
			if (!primaryScore && (['debate', 'mockTrial', 'wsdc'].includes(row.eventType))) primaryScore = 'winloss';

			// If it is not set explicitly, then speech & congress get ranks
			if (!primaryScore) primaryScore = 'rank';

			// What is the scoretag of the row?
			let scoreTag = row.scoreTag;
			if (scoreTag === 'refute') scoreTag = 'point';

			if (scoreTag === primaryScore) {
				if (scoreTag === 'winloss') {
					if (row.scoreValue == 1) {
						results[row.judgeId][scoreTag] = 'W';
					} else {
						results[row.judgeId][scoreTag] = 'L';
					}
				} else {
					if (!results[row.judgeId][scoreTag]) results[row.judgeId][scoreTag] = 0;
					results[row.judgeId][scoreTag] += parseFloat(row.scoreValue);
				}
			}
		}

		// Ignore anything that's already been posted, and secondaries that are not published.
		if (
			(row.postSecondary >= postLevel)
			&& (row.scoreTag !== primaryScore)
		) {

			let scoreTag = row.scoreTag;
			if (scoreTag === 'refute') scoreTag = 'point';

			if (scoreTag === 'winloss') {
				if (row.scoreValue == 1) {
					results[row.judgeId][scoreTag] = 'W';
				} else {
					results[row.judgeId][scoreTag] = 'L';
				}
			} else {
				if (!results[row.judgeId][scoreTag]) results[row.judgeId][scoreTag] = 0;
				results[row.judgeId][scoreTag] += parseFloat(row.scoreValue);
			}

			// Per speaker scores are also called out separately for secondary scores.
			if (row.studentId) {
				if (!results[row.judgeId].students) results[row.judgeId].students = {};

				if (!results[row.judgeId].students[row.studentId]) {
					results[row.judgeId].students[row.studentId] = {
					};
				}

				results[row.judgeId].students[row.studentId][row.scoreTag] = parseFloat(row.scoreValue);
			}
		}

		records.Rounds[row.roundName].Results = results;
	});

	return records;
};

export default {
	entryRecords,
};