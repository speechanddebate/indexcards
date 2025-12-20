import { UnexpectedError } from '../../../helpers/problem';

// General CRUD for the tourn itself
export const updateTourn = {

	GET: async (req, res) => {
		const tourn = await req.db.summon(req.db.tourn, req.params.tournId);
		res.status(200).json(tourn);
	},

	POST: async (req, res) => {
		const tourn = await req.db.summon(req.db.tourn, req.params.tournId);
		const updates = req.body;
		delete updates.id;

		try {
			await tourn.update(updates);
		} catch (err) {
			return UnexpectedError(req, res, err.message);
		}
		res.status(200).json(tourn);
	},

	DELETE: async (req, res) => {
		try {
			await req.db.tourn.destroy({
				where: { id: req.params.tournId },
			});
		} catch {
			return UnexpectedError(req, res, 'An error occured while deleting the tournament.');
		}

		res.status(200).json({
			error: false,
			message: 'Tournament deleted',
		});
	},
};

export default updateTourn;
