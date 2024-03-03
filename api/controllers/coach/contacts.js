// General CRUD for contact coaches
export const updateContact = {

	GET: async (req, res) => {

		res.status(200).json(req.params);
	},

	POST: async (req, res) => {

		const contacts = await req.db.contact.findAll({
			where : {
				school : parseInt(req.body.school),
				person : parseInt(req.body.person),
			},
		});

		if (!contacts) {
			return res.status(200).json('No coach found');
		}

		const contact = contacts.shift();

		for (const dupe of contacts) {
			await dupe.destroy();
		}

		contact[req.body.property_name] = req.body.property_value;
		await contact.save();

		if (contact[req.body.property_name]) {
			res.status(200).json(`Coach is now marked as ${req.body.property_name}`);
		} else {
			res.status(200).json(`Coach is no longer marked as ${req.body.property_name}`);
		}
	},
};

// I find it rather absurdly dumb that you can't post a body to a DELETE.  I mean,
// what's the point of having these verbs if you're not going to be able to use them
// half the time?

export const deleteContact = {

	POST: async (req, res) => {

		const contacts = await req.db.contact.findAll({
			where : {
				school : parseInt(req.body.school),
				person : parseInt(req.body.person),
			},
		});

		for (const contact of contacts) {
			await contact.destroy();
		}

		res.status(200).json({
			message: `Coach removed for your roster`,
			error: false,
		});
	},
};

export default updateContact;
