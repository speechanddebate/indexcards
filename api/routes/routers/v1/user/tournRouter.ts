import { Router } from 'express';
import * as controller from '../../../../controllers/user/tourn/index.js';
import z from 'zod';
//import * as schemas from '../../../openapi/schemas/index.ts';

const router = Router();

// User tourn presence
router.route('/:tournId').get(controller.getPersonTournPresence).openapi = {
	summary: 'Get Tournament Presence',
	operationId: 'UserTourn',
	path : '/user/tourn/{tournId}',
	tags : ['User Tournament'],
	description: 'Get a user connections to a tournament, if any',
	requestParams: {
		path: z.object({
			tournId: z.number().int().positive().meta({ description: 'ID of the tournament' }),
		}),
	},
	responses: {
		200     : { description: 'Person tournament presence' },
	},
};

export default router;