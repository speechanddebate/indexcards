import db from '../../../data/db.js';
import { NotFound } from '../../../helpers/problem.js';

export async function getEntryRecord(req,res) {

	const rawEntries = await db.sequelize.query(`
		select
			entry.id, entry.code, entry.name,

			student.id studentId, student.first studentFirst, student.last studentLast, student.middle studentMiddle,
			hybrid.id hybridId, hybrid.name hybridName, hybrid.code hybridCode,

			school.id schoolId, school.name schoolName, school.code schoolCode,
			school.chapter chapterId,

			event.id eventId, event.name eventName, event.abbr eventAbbr, event.type eventType,
			tourn.id tournId, tourn.name tournName,
			tourn.start tournStart, tourn.city tournCity,
			tourn.state tournState,
			tourn.country tournCountry,

			(select anonymous_public.value
				from event_setting anonymous_public
				where anonymous_public.event = event.id
				and anonymous_public.tag ='anonymous_public'
			) as anonymousPublic,

			(select liveUpdates.value
				from event_setting liveUpdates
				where liveUpdates.event = event.id
				and liveUpdates.tag ='live_updates'
			) as liveUpdates,

			(select affLabel.value
				from event_setting affLabel
				where affLabel.event = event.id
				and affLabel.tag ='aff_label'
			) as affLabel,

			(select negLabel.value
				from event_setting negLabel
				where negLabel.event = event.id
				and negLabel.tag ='neg_label'
			) as negLabel

		from (entry, entry_student es, student, event, tourn)

			left join school on entry.school = school.id

			left join chapter hybrid
				on hybrid.id = student.chapter
				and hybrid.id != school.chapter

		where 1=1
			and entry.id = :entryId
			and entry.id = es.entry
			and es.student = student.id
			and entry.event = event.id
			and event.tourn = tourn.id
		group by student.id
	`, {
		replacements: { ...req.params },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	let entryResult = {};

	rawEntries.forEach( (entry) => {

		if (entry.anonymous_public) {
			return NotFound(req, res,
				`This tournament is set for anonymized public postings, so entry records are not visible`
			);
		}

		if (!entryResult) {
			entryResult = {
				id: entry.id,
				name: entry.name,
				code: entry.code,
				School : {
					id      : entry.schoolId,
					name    : entry.schoolName,
					code    : entry.schoolCode,
				},
				Tourn: {
					id      : entry.tournId,
					name    : entry.tournName,
					start   : entry.tournStart,
					end     : entry.tournEnd,
					city    : entry.tournCity,
					state   : entry.tournState,
					country : entry.tournCountry,
				},
				Event: {
					id   : entry.eventId,
					name : entry.eventName,
					abbr : entry.eventAbbr,
					type : entry.eventType,
					settings : {
						anonymousPublic : entry.anonymousPublic ? true : false,
						liveUpdates     : entry.liveUpdates ? true     : false,
						affLabel        : entry.affLabel || 'Aff',
						negLabel        : entry.negLabel || 'Neg',
					},
				},
				Students: [],
			};

			if (entry.hybridId) {
				entryResult.Hybrid = {
					id      : entry.hybridId,
					name    : entry.hybridName,
					code    : entry.hybridCode,
				};
			};
		}

		entryResult.Students.push({
			id     : entry.studentId,
			first  : entry.studentFirst,
			middle : entry.studentMiddle,
			last   : entry.studentLast,
		});
	});

	const rawResults = await db.Sequelize.query(`

		select
			round.id, round.name, round.label, round.type,

			round.published, round.postPrimary, round.postSecondary,

			panel.bye panelBye,
			ballot.side side, ballot.speakerorder speakerorder,
			ballot.bye ballotBye, ballot.forfeit ballotForfeit,
			ballot.entry entryId,

			judge.id judgeId, judge.first judgeFirst, judge.last judgeLast,

			winloss.id winlossId,
			winloss.value winloss,
			rank.value rank, rank.student rankStudent,
			point.value point, point.value pointStudent,

			opp_entry.id oppId,
			opp_entry.code oppCode

		from (round, panel, ballot)

			left join judge on ballot.judge = judge.id

			left join ballot opp_ballot
				on opp_ballot.panel = panel.id
				and opp_ballot.judge = judge.id
				and opp_ballot.id != ballot.id
				and opp_ballot.entry != ballot.entry

			left join entry opp_entry
				on opp_entry.id = opp_ballot.entry

			left join score winloss
				on winloss.ballot = ballot.id
				and winloss.tag   = 'winloss'
				and winloss.value = 1

			left join score rank
				on rank.ballot = ballot.id
				and rank.tag   = 'rank'

			left join score point
				on point.ballot = ballot.id
				and point.tag   = 'point'

		where 1=1

			and ballot.entry    = ?
			and ballot.panel    = panel.id
			and panel.round     = round.id
			and round.published = 1

		group by ballot.id
		order by round.name DESC
	`, {
		replacements: { ...req.params },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	entryResult.rawResult = rawResults;
	// obviously not but I wanted to check in mid progress for this unused API
	// and the linter woudln't STFU

	return res.status(200).json(entryResult);
};
