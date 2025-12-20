import { UnexpectedError } from '../../../helpers/problem';

// General CRUD for the event itself
export const updateEvent = {

	GET: async (req, res) => {
		const event = await req.db.summon(req.db.event, req.params.eventId);
		res.status(200).json(event);
	},

	POST: async (req, res) => {
		const event = await req.db.summon(req.db.event, req.params.eventId);
		const updates = req.body;
		delete updates.id;

		try {
			await event.update(updates);
		} catch (err) {
			return UnexpectedError(res, err.message);
		}
		res.status(200).json(event);
	},

	DELETE: async (req, res) => {
		try {
			await req.db.event.destroy({
				where: { id: req.params.eventId },
			});
		} catch (err) {
			return UnexpectedError(res, err.message);
		}

		res.status(200).json({
			error: false,
			message: 'Event deleted',
		});
	},
};

export default updateEvent;
