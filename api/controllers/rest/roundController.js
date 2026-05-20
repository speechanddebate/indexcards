import { NotFound } from '../../helpers/problem.js';
import roundRepo from '../../repos/roundRepo.js';
import { entryWins } from '../../services/results/entryWins.js';
import { getSchematic } from '../pages/invite/schematController.js';
import db from '../../data/db.js';

export async function getPublishedRounds(req, res) {

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
			'eventId'       : round.event,
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

export async function getPublishedRound(req,res) {

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

export async function getPublishedSchematic(req,res) {
	return getSchematic(req,res);
}

export async function getPublishedBrackets(req, res) {
	const records = await entryWins({
		...req.params,
	});
	console.log(records);
	console.log('end of records');
	return res.status(200).json(records);
}

export async function getPublishedResults(req, res) {

}
