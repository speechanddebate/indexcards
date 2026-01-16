// import { showDateTime } from '../../../helpers/common';

import { UnexpectedError } from '../../../helpers/problem.js';
import db from '../../../data/db.js';

// General CRUD for the timeslot itself

export async function getTimeslot(req, res) {
	const timeslot = await db.summon(db.timeslot, req.params.timeslotId);
	res.status(200).json(timeslot);
}
export async function createTimeslot(req, res) {
	const timeslot = await db.summon(db.timeslot, req.params.timeslotId);
	const updates = req.body;
	delete updates.id;

	try {
		await timeslot.update(updates);
	} catch (err) {
		return UnexpectedError(req, res, err.message);
	}
	res.status(200).json(timeslot);
};

export async function deleteTimeslot(req, res) {
	try {
		await db.timeslot.destroy({
			where: { id: req.params.timeslotId },
		});
	} catch {
		return UnexpectedError(req, res, 'An error occured while deleting the tournament.');
	}

	res.status(200).json({
		error: false,
		message: 'Timeslot deleted',
	});
};