// General CRUD for the section itself
export const updateSection = {

	GET: async (req, res) => {
		const section = await req.db.summon(req.db.section, req.params.sectionId);
		res.status(200).json(section);
	},

	// This will not create a section because the section ID is already encoded
	// here.  So instead just update the existing section

	POST: async (req, res) => {
		const section = await req.db.summon(req.db.section, req.params.sectionId);
		const updates = req.body;
		delete updates.id;

		try {
			await section.update(updates);
		} catch (err) {
			res.status(400).json({
				error: true,
				message: err,
			});
		}
		res.status(200).json(section);
	},

	DELETE: async (req, res) => {
		try {
			await req.db.section.destroy({
				where: { id: req.params.sectionId },
			});
		} catch (err) {
			res.status(401).json(err);
		}

		res.status(200).json({
			error: false,
			message: 'Section deleted',
		});
	},
};

export default updateSection;
