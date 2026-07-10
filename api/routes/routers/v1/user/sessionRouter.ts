import { Router } from 'express';
import * as schemas from '../../../openapi/schemas/index.js';

const router = Router();

import { getSession } from '../../../../controllers/user/person/session.js';

router.route('/').get(getSession).openapi = {
	path: '/user/session',
	summary: 'Get Session',
	description: 'Get the current user session',
	operationId: 'UserSession',
	tags: ['Session', 'Orval'],
	responses: {
		200: {
			description: 'User session',
			content: {
				'application/json': {
					schema: schemas.Session,
				},
			},
		},
		404: {
			$ref: '#/components/responses/NotFound',
		},
	},
};

export default router;