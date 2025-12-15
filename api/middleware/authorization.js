import personRepo from '../repos/personRepo.js';
import { Unauthorized, Forbidden } from '../helpers/problem.js';
export async function requireAreaAccess(req, res, next) {
	if (!req.person) {
		return Unauthorized(res,'User not Authenticated');
	}

	const personId = req.person.id;
	const area = req.params.area;

	try {
		const hasAccess = await personRepo.hasAreaAccess(personId, area);

		if (!hasAccess) {
			return Forbidden(res,`Access to ${area} is forbidden for your API credentials`);
		}

		next();
	} catch (err) {
		return res.status(500).json({
			message: 'Authorization check failed',
			error: err.message,
		});
	}
}