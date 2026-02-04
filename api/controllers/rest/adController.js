import db from '../../data/db.js';

export async function getAds(req, res) {
	return res.status(503);
};

getAds.openapi = {
	summary     : 'Get ads',
	description : 'returns an array of ads',
	operationId : 'getAds',
	tags        : ['ads', 'admin'],
	responses: {
		200: {
			description: 'An array of Ads to be displayed',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/Ad' },
					},
				},
			},
		},
		401     : { $ref: '#/components/responses/Unauthorized'  },
		default : { $ref: '#/components/responses/ErrorResponse' },
	},
};

export async function getPublishedAds(req,res) {
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
};

getPublishedAds.openapi = {
	summary     : 'GET public ads',
	description : 'returns an array of current, approved ads to be displayed on the tabroom homepage.',
	operationId : 'getPublishedAds',
	tags        : ['ads','public'],
	security    : [],
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