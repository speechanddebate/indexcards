export async function updateLastAccess(req,res) {
	if (req.session?.Su) {
		return res.status(200).json({
			message     : 'Update skipped; SU session',
			last_access : req.session.last_access,
		});
	}

	// Only need to update this once a day or so.
	const last = Date.parse(req.session.last_access);
	const now  = new Date();
	const then = now.setDate(now.getDate() - 1);

	let response = {};

	if (
		(Number.isNaN(last) || last < then)
		|| req.query.forceUpdate
	) {
		response = await req.db.sequelize.query(`
			update session set last_access = NOW()
			where session.id = :sessionId
		`, {
			replacements: { sessionId: req.session.id },
			type: req.db.sequelize.QueryTypes.UPDATE,
		});

		response = {
			message: 'Update performed',
			last_access: new Date(),
		};

	} else {
		response = {
			message: 'Update unnecessary',
			last_access: req.session.last_access,
		};
	}

	return res.status(200).json(response);
};

export default updateLastAccess;
