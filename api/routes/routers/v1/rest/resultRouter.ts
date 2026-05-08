import { Router } from 'express';
import * as controller from '../../../../controllers/rest/resultController.js';
import  z from 'zod';
import * as utils from '../../../openapi/schemas/utils.js';
import { ValidateRequest } from '../../../../middleware/validation.js';

const router = Router({ mergeParams: true });
// Bolted onto /tourns/:tournId/results

router.route('/').get(ValidateRequest, controller.getResultSets).openapi = {
	path: '/rest/tourns/{tournId}/results',
	summary: "Get tournament results",
	description: 'Returns public result information for a given tournament',
	operationId : 'getTournResultSets',
	requestParams: {
		path: z.object({
			tournId: utils.id.meta({ description: 'ID of the tournament to get results for' }),
		}),
	},
	responses: {
		200: {
			description: 'Result Sets connected to a given event, with published aggregated result data attached',
			content: {
				'application/json': {
					schema: {
						type: 'object',
					},
				},
			},
		},
	},
	tags: ['invite', 'public', 'results', 'pairings'],
};

router.route('/:resultSetId').get(ValidateRequest, controller.getResultSet).openapi = {
	path: '/rest/tourns/{tournId}/results/{resultSetId}',
	summary: "Get tourn resultSet",
	description: 'Returns result information given a result set ID if it is public',
	operationId : 'getResultSet',
	requestParams: {
		path: z.object({
			tournId: utils.id.meta({ description: 'ID of the tournament to get results for' }),
			resultSetId: utils.id.meta({ description: 'ID of the result set to get' }),
		}),
	},
	responses: {
		200: {
			description: 'Result Set with published aggregated result data attached',
			content: {
				'application/json': {
					schema: {
						type: 'object',
					},
				},
			},
		},
	},
	tags: ['invite', 'public', 'results', 'pairings'],
};

router.route('/event/:eventId').get(ValidateRequest, controller.getResultSets).openapi = {
	path: '/rest/tourns/{tournId}/results/event/{eventId}',
	summary: "Get event results",
	description: 'Returns public result information for a given event',
	operationId : 'getEventResultSets',
	requestParams: {
		path: z.object({
			tournId: utils.id.meta({ description: 'ID of the tournament to get results for' }),
			eventId: utils.id.meta({ description: 'ID of the event to get results for' }),
		}),
	},
	responses: {
		200: {
			description: 'Result Sets connected to a given event, with published aggregated result data attached',
			content: {
				'application/json': {
					schema: {
						type: 'object',
					},
				},
			},
		},
	},
	tags: ['invite', 'public', 'results', 'pairings'],
};

export default router;