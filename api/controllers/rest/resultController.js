import { NotFound } from '../../helpers/problem.js';
import resultSetRepo from '../../repos/resultSetRepo.js';
import { tiebreakTypes } from '../../services/results/tiebreakTypes.js';

export async function getBracket(req, res) {
	const bracket = await resultSetRepo.getResultSets({
		eventId: req.params.eventId,
		tag: 'bracket',
	});

	if (bracket && bracket.published) return res.status(200).json(bracket);
	return NotFound( req, res, 'No bracket was found for event');
}

export async function getResultSet(req,res) {
	const resultSet = await resultSetRepo.getResultSet(req.params.resultSetId);
	if (resultSet) {
		return res.status(200).json(resultSet);
	}
	return NotFound( req, res, 'No bracket was found for event');
}

export async function getResultSets(req,res) {
	const resultSet = await resultSetRepo.getResultSets({ ...req.params }, { noResults: true});

	if (resultSet) {
		return res.status(200).json(resultSet);
	}
	return NotFound( req, res, 'No bracket was found for event');
}

export async function getTiebreaks(req, res) {
	const answer = await tiebreakTypes({...req.params});
	return res.status(200).json(answer);
}
