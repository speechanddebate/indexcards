import { Router } from 'express';
import * as controller from '../../../../controllers/rest/adController.js';
import z from 'zod';
import { HomepageAd } from '../../../openapi/schemas/index.js';
import { HomepageAdExample } from '../../../openapi/examples/Ad.js';

const router = Router();

// Access through /rest/ads
router.route('/').get(controller.getPublishedAds).openapi = {
	path: '/rest/ads',
	summary     : 'Get ads',
	description : 'returns an array of ads for the homepage.',
	operationId : 'restAds',
	tags        : ['Ads','Orval'],
	responses: {
		200: {
			description: 'An array of Ads to be displayed',
			content: {
				'application/json': {
					schema: z.array(HomepageAd),
					example: HomepageAdExample,
				},
			},
		},
	},
};

export default router;