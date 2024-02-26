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
			res.status(400).json({
				error: true,
				message: err,
			});
		}
		res.status(200).json(event);
	},

	DELETE: async (req, res) => {
		try {
			await req.db.event.destroy({
				where: { id: req.params.eventId },
			});
		} catch (err) {
			res.status(401).json(err);
		}

		res.status(200).json({
			error: false,
			message: 'Event deleted',
		});
	},
};

