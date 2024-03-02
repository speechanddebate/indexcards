// General CRUD for contact coaches
export const updateContact = {

	GET: async (req, res) => {
		const category = await req.db.summon(req.db.category, req.params.categoryId);
		res.status(200).json(category);
	},

	POST: async (req, res) => {

		const contacts = await req.db.findAll({
			where : { school : req.params.schoolId, person: req.params.personId },
		});

		if (!contacts) {
			return res.status(200).json('No coach found');
		}

		const contact = contact.shift();

		for (const dupe of contacts) {
			await dupe.destroy();
		}

		contact[req.body.tag] = req.body.property_value;
		await contact.save();

		if (contact[req.body.tag]) {
			res.status(200).json(`Coach is now marked as ${req.body.tag}`);
		} else {
			res.status(200).json(`Coach is no longer marked as ${req.body.tag}`);
		}
	},

	DELETE: async (req, res) => {

		const contacts = await req.db.findAll({
			where : { school : req.params.schoolId, person: req.params.personId },
		});

		for (const contact of contacts) {
			await contact.destroy();
		}

		res.status(200).json(`Coach removed from your roster`);
	},
};

export default updateContact;
