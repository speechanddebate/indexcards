import { UnexpectedError } from '../../../helpers/problem.js';

// Get tournament
export async function getTourn(req, res) {
	const tourn = await req.db.summon(req.db.tourn, req.params.tournId);
	res.status(200).json(tourn);
}

// Update tournament
export async function updateTourn(req, res) {
	const tourn = await req.db.summon(req.db.tourn, req.params.tournId);
	const updates = req.body;
	delete updates.id;

	try {
		await tourn.update(updates);
	} catch (err) {
		return UnexpectedError(req, res, err.message);
	}
	res.status(200).json(tourn);
}

// Delete tournament
export async function deleteTourn(req, res) {
	try {
		await req.db.tourn.destroy({
			where: { id: req.params.tournId },
		});
	} catch {
		return UnexpectedError(req, res, 'An error occurred while deleting the tournament.');
	}

	res.status(200).json({
		error: false,
		message: 'Tournament deleted',
	});
}