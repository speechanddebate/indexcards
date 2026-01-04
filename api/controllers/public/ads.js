export const PublicAds = {

	GET: async (req, res) => {

		const db = req.db;

		const currentAds = await db.sequelize.query(`
			select id, filename, url, background
				from ad
			where ad.start < NOW()
				and ad.end > NOW()
				and ad.approved = 1
			order by ad.sort_order, RAND()
		`, {
			type: db.sequelize.QueryTypes.SELECT,
		});

		return res.status(200).json(currentAds);
	},
};

PublicAds.GET.apiDoc = {
	summary     : 'Return list of ads to display on front page',
	description : 'returns an array of current, approved ads to be displayed on the tabroom homepage.',
	security: [],
	operationId : 'getAds',
	tags        : ['public'],
	responses: {
		200: {
			description: 'An array of Ads to be displayed',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/PublicAd' },
					},
				},
			},
		},
		401     : { $ref: '#/components/responses/Unauthorized'  },
		default : { $ref: '#/components/responses/ErrorResponse' },
	},
};