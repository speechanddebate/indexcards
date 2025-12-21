export async function getAds(res,req) {
	return res.status(503);
};
getAds.openapi = {
	summary     : 'Return list of ads',
	description : 'returns an array of ads ',
	operationId : 'getAds',
	tags        : ['ads'],
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

};
getPublishedAds.openapi = {
	summary     : 'Return list of published ads to display on front page',
	description : 'returns an array of current, approved ads to be displayed on the tabroom homepage.',
	operationId : 'getPublishedAds',
	tags        : ['ads','public'],
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