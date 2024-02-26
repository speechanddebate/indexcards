// General CRUD for the category itself
export const updateCategory = {

	GET: async (req, res) => {
		const category = await req.db.summon(req.db.category, req.params.categoryId);
		res.status(200).json(category);
	},

	POST: async (req, res) => {
		const category = await req.db.summon(req.db.category, req.params.categoryId);
		const updates = req.body;
		delete updates.id;

		try {
			await category.update(updates);
		} catch (err) {
			res.status(400).json({
				error: true,
				message: err,
			});
		}
		res.status(200).json(category);
	},

	DELETE: async (req, res) => {
		try {
			await req.db.category.destroy({
				where: { id: req.params.categoryId },
			});
		} catch (err) {
			res.status(401).json(err);
		}

		res.status(200).json({
			error: false,
			message: 'Category deleted',
		});
	},
};

