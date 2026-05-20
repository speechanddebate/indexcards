import { Router } from 'express';
import * as controller from '../../../../controllers/user/tourn/index.js';
//import * as schemas from '../../../openapi/schemas/index.js';

const router = Router();

// User tourn presence
router.route('/:tournId').get(controller.getPersonTournPresence).openapi = {
	path : '/user/tourn/{tournId}',
	tags : ['User Tournament'],
	description: 'Get a user connections to a tournament, if any',
	parameters: [{
		in       : 'path',
		name     : 'tournId',
		required : true,
		schema   : { type: 'integer' }
	}],
	responses: {
		200     : { description: 'Person tournament presence' },
		default : { $ref: '#/components/responses/ErrorResponse' }
	},
};

export default router;