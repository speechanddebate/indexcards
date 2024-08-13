export const updateLastAccess = {

	GET: async (req, res) => {

		if (req.session.su) {
			return res.status(200).json('OK');
		}

		const last = Date.parse(req.session.last_access);
		const now  = new Date();
		const then = now.setDate(now.getDate() - 1);

		console.log(`Last is ${last}`);
		console.log(`Yesterday is is ${then}`);

		if (last < then) {
			await req.db.sequelize.query(`
				update session set last_access = NOW()
				where session.id = :sessionId
			`, {
				replacements: { sessionId: req.session.id },
				type: req.db.sequelize.QueryTypes.UPDATE,
			});
			console.log(`Updated the last access datestamp for ${req.session.id} user ${req.session.person}`);
		}

		return res.status(200).json('OK');
	},
};

export default updateLastAccess;
