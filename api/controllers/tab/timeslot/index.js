// import { showDateTime } from '../../../helpers/common';

import { UnexpectedError } from '../../../helpers/problem';

// General CRUD for the timeslot itself

export const updateTimeslot = {

	GET: async (req, res) => {
		const timeslot = await req.db.summon(req.db.timeslot, req.params.timeslotId);
		res.status(200).json(timeslot);
	},

	POST: async (req, res) => {
		const timeslot = await req.db.summon(req.db.timeslot, req.params.timeslotId);
		const updates = req.body;
		delete updates.id;

		try {
			await timeslot.update(updates);
		} catch (err) {
			return UnexpectedError(res, err.message);
		}
		res.status(200).json(timeslot);
	},

	DELETE: async (req, res) => {
		try {
			await req.db.timeslot.destroy({
				where: { id: req.params.timeslotId },
			});
		} catch {
			return UnexpectedError(res, 'An error occured while deleting the tournament.');
		}

		res.status(200).json({
			error: false,
			message: 'Timeslot deleted',
		});
	},
};

export default updateTimeslot;
