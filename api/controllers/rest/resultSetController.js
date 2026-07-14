import { NotFound } from '../../helpers/problem.js';
import resultSetRepo from '../../repos/resultSetRepo.js';
import { tiebreakTypes } from '../../services/results/tiebreakTypes.js';

export async function getResultSet(req,res) {

	// For now the site admins get to do nocache but nobody else does
	let queryParams;
	if (req.person?.site_admin) {
		queryParams = { ...req.valid.query };
	}

	const resultSet = await resultSetRepo.getResultSet(
		{ ...req.valid.params },
		{ ...queryParams },
	);
	if (resultSet.length > 0) {
		return res.status(200).json(resultSet);
	}
	return NotFound( req, res, 'No bracket was found for event');
}

export async function getResultSets(req,res) {

	// For now the site admins get to do nocache but nobody else does
	let queryParams;
	if (req.person?.site_admin) {
		queryParams = { ...req.valid.query };
	}

	const resultSet = await resultSetRepo.getResultSets(
		{ ...req.valid.params },
		{ ...queryParams },
	);

	if (resultSet) {
		return res.status(200).json(resultSet);
	}
	return NotFound( req, res, 'No bracket was found for event');
}

export async function getTiebreaks(req, res) {
	const answer = await tiebreakTypes({...req.valid.params});
	return res.status(200).json(answer);
}
