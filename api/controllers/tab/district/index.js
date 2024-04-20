// General CRUD for the district itself
export const updateDistrict = {

	GET: async (req, res) => {
		const district = await req.db.summon(req.db.district, req.params.districtId);
		res.status(200).json(district);
	},

	POST: async (req, res) => {
		const district = await req.db.summon(req.db.district, req.params.districtId);
		const updates = req.body;
		delete updates.id;

		try {
			await district.update(updates);
		} catch (err) {
			res.status(400).json({
				error: true,
				message: err,
			});
		}
		res.status(200).json(district);
	},

	DELETE: async (req, res) => {
		try {
			await req.db.district.destroy({
				where: { id: req.params.districtId },
			});
		} catch (err) {
			res.status(401).json(err);
		}

		res.status(200).json({
			error: false,
			message: 'District deleted',
		});
	},
};

export default updateDistrict;
