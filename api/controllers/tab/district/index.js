import { UnexpectedError } from '../../../helpers/problem.js';
import db from '../../../data/db.js';

// General CRUD for the district itself
// Get district (read)
export async function getDistrict(req, res) {
	const district = await db.summon(db.district, req.params.districtId);
	res.status(200).json(district);
}

// Update district (update)
export async function updateDistrict(req, res) {
	const district = await db.summon(db.district, req.params.districtId);
	const updates = req.body;
	delete updates.id;

	try {
		await district.update(updates);
	} catch (err) {
		return UnexpectedError(req, res, err.message);
	}
	res.status(200).json(district);
}

// Delete district
export async function deleteDistrict(req, res) {
	try {
		await db.district.destroy({
			where: { id: req.params.districtId },
		});
	} catch (err) {
		return UnexpectedError(req, res, err.message);
	}

	res.status(200).json({
		error: false,
		message: 'District deleted',
	});
}
