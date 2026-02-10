import { UnexpectedError } from '../../../helpers/problem.js';

// General CRUD for the event itself
// Get event (read)
export async function getEvent(req, res) {
	const event = await req.db.summon(req.db.event, req.params.eventId);
	res.status(200).json(event);
}

// Update event (update)
export async function updateEvent(req, res) {
	const event = await req.db.summon(req.db.event, req.params.eventId);
	const updates = req.body;
	delete updates.id;

	try {
		await event.update(updates);
	} catch (err) {
		return UnexpectedError(req, res, err.message);
	}
	res.status(200).json(event);
}

// Delete event
export async function deleteEvent(req, res) {
	try {
		await req.db.event.destroy({
			where: { id: req.params.eventId },
		});
	} catch (err) {
		return UnexpectedError(req, res, err.message);
	}

	res.status(200).json({
		error: false,
		message: 'Event deleted',
	});
}

export default updateEvent;
