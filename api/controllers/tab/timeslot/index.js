// import { showDateTime } from '../../../helpers/common';

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
			res.status(400).json({
				error: true,
				message: err,
			});
		}
		res.status(200).json(timeslot);
	},

	DELETE: async (req, res) => {
		try {
			await req.db.timeslot.destroy({
				where: { id: req.params.timeslotId },
			});
		} catch (err) {
			res.status(401).json(err);
		}

		res.status(200).json({
			error: false,
			message: 'Timeslot deleted',
		});
	},
};

export default updateTimeslot;
