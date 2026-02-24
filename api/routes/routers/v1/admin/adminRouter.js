import { Router } from 'express';
import { requireSiteAdmin } from '../../../../middleware/authorization/authorization.js';
import serversRouter from'./serversRouter.js';

import * as controller from '../../../../controllers/admin/mailtestController.js';

const router = Router();

router.use(requireSiteAdmin);

router.use('/servers', serversRouter);

router.route('/mailtest/error').get(controller.throwTestError).openapi = {
	path: '/admin/mailtest/error',
	summary: 'Undocumented Endpoint',
	tags: ['Admin : Mail'],
	security: [{ basic: [] }],
	responses: {
		'200': {
			description: 'OK',
		},
		'401' : { $ref: '#/components/responses/Unauthorized' },
	},
};

router.route('/mailtest/slack').get(controller.testSlackNotification).openapi = {
	path: '/admin/mailtest/slack',
	summary: 'Undocumented Endpoint',
	tags: ['Admin : Mail'],
	responses: {
		'200': {
			description: 'OK',
		},
		'401' : { $ref: '#/components/responses/Unauthorized' },
	},
};

export default router;