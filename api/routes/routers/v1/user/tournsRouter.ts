import { Router } from 'express';
import * as controller from '../../../../controllers/user/tourn/index.js';
import { ValidateRequest } from '../../../../middleware/validation.js';
import z from 'zod';
import { Tourn, Fine, CurrentBallot, PersonTournSummary } from '../../../openapi/schemas/index.js';

const router = Router();

router.route('/').get(ValidateRequest,controller.getPersonTourns).openapi = {
	summary: 'Get Current Tourns',
	operationId: 'UserTourns',
	path : '/user/tourns',
	tags : ['User Tournament','Orval'],
	description: 'Returns an array of Tourns a person is involved in.',
	requestParams: {
		query: z.object({
			endAfter: z.iso.datetime().optional(),
		}),
	},
	responses: {
		200     : {
			description: 'Tourn Summary',
			content: {
				'application/json': {
					schema: z.array(Tourn),
				},
			},
		},
	},
};
// User tourn presence
router.route('/:tournId').get(controller.getPersonTournPresence).openapi = {
	summary: 'Get Tournament Presence',
	operationId: 'UserTourn',
	path : '/user/tourns/{tournId}',
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

router.route('/:tournId/summary').get(ValidateRequest,controller.getTournSummary).openapi = {
	summary: 'Get Summary',
	operationId: 'UserTournsSummary',
	path : '/user/tourns/{tournId}/summary',
	tags : ['User Tournament','Orval'],
	description: 'Returns a summary of a users role in a tourn.',
	requestParams: {
		path: z.object({ tournId: z.coerce.number().int().positive() })
	},
	responses: {
		200     : {
			description: 'Summary',
			content: {
				'application/json': {
					schema: PersonTournSummary,
				},
			},
		},
	},
};

router.route('/:tournId/fines').get(ValidateRequest,controller.getTournFines).openapi = {
	summary: 'Get Fines',
	operationId: 'UserTournsFines',
	path : '/user/tourns/{tournId}/fines',
	tags : ['User Tournament','Orval'],
	description: 'Returns an array of Fines for the tourn.',
	requestParams: {
		path: z.object({ tournId: z.coerce.number().int().positive() })
	},
	responses: {
		200     : {
			description: 'Fines',
			content: {
				'application/json': {
					schema: z.array(Fine),
				},
			},
		},
	},
};

router.route('/:tournId/ballots').get(ValidateRequest,controller.getTournBallots).openapi = {
	summary: 'Get Ballots',
	operationId: 'UserTournsBallots',
	path : '/user/tourns/{tournId}/ballots',
	tags : ['User Tournament','Orval'],
	description: 'Returns an array of Fines for the tourn.',
	requestParams: {
		path: z.object({ tournId: z.coerce.number().int().positive() }),
		query: z.object({
			audited: z.boolean().default(false),
		})
	},
	responses: {
		200     : {
			description: 'Ballots',
			content: {
				'application/json': {
					schema: z.array(CurrentBallot),
				},
			},
		},
	},
};

export default router;
