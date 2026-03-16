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

	return res.status(200).json(entryResult);
};
