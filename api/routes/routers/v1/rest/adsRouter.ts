import { Router } from 'express';
import * as controller from '../../../../controllers/rest/adController.js';

const router = Router();

// Access through /rest/ads

router.route('/').get(controller.getPublishedAds).openapi = {
	path: '/rest/ads',
	summary     : 'Get ads',
	description : 'returns an array of ads',
	operationId : 'restAds',
	tags        : ['Ads','Orval'],
	responses: {
		200: {
			description: 'An array of Ads to be displayed',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								url: { type: 'string' },
								imgSrc: { type: 'string' },
								background: { type: 'string' },
							},
						},
					},
				},
			},
		},
		default : { $ref: '#/components/responses/ErrorResponse' },
	},
};

export default router;