import { NotFound } from '../../helpers/problem.js';
import roundRepo from '../../repos/roundRepo.js';
import { entryWins } from '../../services/results/entryWins.js';
import db from '../../data/db.js';

export async function getRound(req,res) {

	const round = await roundRepo.getRound(req.params.roundId);

	if (!round) {
		return NotFound(req, res, `No round found with ID ${req.params.roundId}`);
	}

	if (round.tournId !== req.params.tournId) {
		return NotFound(req, res,
			`No round found with ID ${req.params.roundID} belonging to tournament ${req.params.tournId}`
		);
	}

	delete round.tournId;
	delete round.pods;
	delete round.noJudgeCodes;
	delete round.sidelockElims;
	delete round.noSideConstraints;
	delete round.affLabel;
	delete round.negLabel;
	delete round.showSectionLetters;
	delete round.includeRoomNotes;
	delete round.useNormalRooms;

	return res.status(200).json(round);
}

export async function getEntryRecordsByRound(req, res) {
	// This is public only for now but at some point needs to be auth informed
	// so that coaches, entries, and admins get the full shebang as outlined in
	// the service function.
	const records = entryWins({ ...req.params });
	return res.status(200).json(records);
};

export async function getPublishedRounds(req, res){

	// Removed from Sequelize because it apparently lacks a (documented) WHERE
	// EXISTS support, or at least not one I could find in less time it took me
	// to just write this raw query alas.

	const rounds = await db.sequelize.query(`
		select
			round.*,
			event.id eventId,
			event.name eventName,
			event.abbr eventAbbr,
			event.type eventType,
			event.level eventLevel,
			event.nsda_category nsdaCategory
		from round, event, tourn
			where 1=1
			and round.published = 1
			and round.event = event.id
			and event.tourn = tourn.id
			and tourn.hidden != 1
			and tourn.id = :tournId
			and EXISTS (
				select panel.id
				from (panel, ballot)
				where 1=1
				and panel.round = round.id
				and panel.id = ballot.panel
				and ballot.entry IS NOT NULL
			)
	`, {
		replacements: { ...req.params },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	const mappedRounds = rounds.map( (round) => {
		return {
			'id'            : round.id,
			'type'          : round.type,
			'name'          : round.name,
			'label'         : round.label,
			'flighted'      : round.flighted,
			'postPrimary'   : round.post_primary,
			'postSecondary' : round.post_secondary,
			'postFeedback'  : round.post_feedback,
			'published'     : round.published,
			'eventId'       : round.event_id,
			'protocolId'    : round.protocol_id,
			Event              : {
				'id'           : round.eventId,
				'name'         : round.eventName,
				'abbr'         : round.eventAbbr,
				'type'         : round.eventType,
				'level'        : round.eventLevel,
				'nsdaCategory' : round.nsdaCategory,
			},
		};
	});

	return res.status(200).json(mappedRounds);
};

export async function getSchematic(req,res){
	const round = await roundRepo.getRound(req.params.roundId);

	if (!round) {
		return NotFound(req, res, `No round found with ID ${req.params.roundID}`);
	}

	let sections = await roundRepo.getSectionsByRound(round.id);

	// If things are anonymous, just cut all identifying information out now. I
	// do this here and not within sections because a lot of it is keyed to
	// aspects of the round settings

	if (round.anonymous_public) {

		sections = sections.map ( (section) => {
			delete section.entryName;
			delete section.entryId;
			delete section.entrySchoolId;
			delete section.judgeId;
			delete section.judgeSchoolId;
			delete section.judgeFirst;
			delete section.judgeLast;
			return section;
		});
	}

	if ( round.published === 'entryList') {

		const entries = sections.map( (section) => {
			return {
				entryId     : section.entryId,
				entryCode   : section.entryCode,
				entrySchool : section.entrySchoolId,
				entryName   : section.entryName,
			};
		});

		round.entries = [...new Set(entries)];
		return res.status(200).json(round);
	}

	if ( round.published === 'chambers') {

		const entries = sections.map( (section) => {
			return {
				entryId   : section.entryId,
				entryCode : section.entryCode,
				entryName : section.entryName,
				chamber   : section.letter,
				roomName  : section.roomName,
			};
		});

		round.entries = [...new Set(entries)];
		return res.status(200).json(round);
	}

	if (round.published === 'noJudges') {
		sections = sections.map ( (section) => {
			delete section.judgeCode;
			return section;
		});
	}

	// If I'm here it's a true pairing and therefore needs populated sections.
	round.sections = {};

	for (const section of sections) {

		if (!round.sections[section.id]) {

			round.sections[section.id] = {
				id        : section.id,
				bye       : section.bye ? true : false,
				roomName  : section.roomName,
				roomId    : section.roomId,
				judges    : {},
				entries   : {},
				judgeKeys : [],
				entryKeys : [],
			};

			if (round.showSectionLetters) {
				round.sections[section.id].letter = section.letter;
			}

			if (round.flighted) {
				round.sections[section.id].flight = section.flight;
			}

			if (round.includeRoomNotes) {
				round.sections[section.id].roomNotes = section.roomNotes;
			}
			if (section.roomUrl) {
				round.sections[section.id].roomUrl = section.roomUrl;
			}
		}

		if (!round.sections[section.id].judges[section.judgeId]) {

			const judge = {
				id     : section.judgeId,
				first  : section.judgeFirst,
				middle : section.judgeMiddle,
				last   : section.judgeLast,
				chair  : section.judgeChair,
				school : section.judgeSchoolId,
			};

			if ( !section.noJudgeCodes && section.judgeCode) {
				judge.code = section.judgeCode;
			}

			round.sections[section.id].judges[section.judgeId] = judge;

			// This is redundant yes but it's handy and the front end is
			// going to have to do the same, so save it steps.

			round.sections[section.id].judgeKeys.push(judge.id);
		}

		if (!round.sections[section.id].entries[section.entryId]) {

			const entry = {
				id       : section.entryId,
				schoolId : section.entrySchoolId,
				first    : section.entryName,
				code     : section.entryCode,
			};

			if (section.side) {
				entry.side = section.side;
			}

			if (section.speakerorder) {
				entry.speakerOrder = section.speakerorder;
			}

			round.sections[section.id].entries[section.entryId] = entry;
			round.sections[section.id].entryKeys.push(entry.id);
		}
	}

	delete round.noJudgeCodes;
	delete round.includeRoomNotes;
	return res.status(200).json(round);
}
