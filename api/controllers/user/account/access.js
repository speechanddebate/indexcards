export const updateLastAccess = {

	GET: async (req, res) => {

		if (req.session.su > 0) {
			return res.status(200).json('OK - Update skipped due to SU session');
		}

		const last = Date.parse(`${req.session.last_access}Z`);
		const dateLimit  = new Date();
		dateLimit.setHours(dateLimit.getHours() - 2 );

		if ( Number.isNaN(last) || last < dateLimit) {
			await req.db.sequelize.query(`
				update session set last_access = NOW()
				where session.id = :sessionId
			`, {
				replacements: { sessionId: req.session.id },
				type: req.db.sequelize.QueryTypes.UPDATE,
			});
		}

		return res.status(200).json('OK');
	},
};

export default updateLastAccess;
