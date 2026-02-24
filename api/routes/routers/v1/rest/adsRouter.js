import { Router } from 'express';
import * as controller from '../../../../controllers/rest/adController.js';
import { requireSiteAdmin } from '../../../../middleware/authorization/authorization.js';

const router = Router();

// Access through /rest/ads

router.route('/').get(requireSiteAdmin, controller.getAds).openapi = {
	path: '/rest/ads',
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

router.route('/published').get(controller.getPublishedAds).openapi = {
	path: '/rest/ads/published',
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
		default : { $ref: '#/components/responses/ErrorResponse' },
	},
};

export default router;