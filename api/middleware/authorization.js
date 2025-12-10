import personRepo from '../repos/personRepo.js';
export async function requireAreaAccess(req, res, next) {
	if (!req.person) {
		return res.status(401).json({ message: 'User not authenticated' });
	}

	const personId = req.person.id;
	const area = req.params.area;

	try {
		const hasAccess = await personRepo.hasAreaAccess(personId, area);

		if (!hasAccess) {
			return res.status(403).json({
				message: `Access to ${area} is forbidden for your API credentials`,
			});
		}

		next();
	} catch (err) {
		return res.status(500).json({
			message: 'Authorization check failed',
			error: err.message,
		});
	}
}