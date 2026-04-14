import { Router } from 'express';
import * as controller from '../../../../controllers/rest/resultController.js';

const router = Router({ mergeParams: true });
// Bolted onto /tourns/:tournId/results

router.route('/').get(controller.getResultSets).openapi = {
	path: '/rest/tourns/{tournId}/results',
	summary     : 'Returns public result sets for a given tournament',
	operationId : 'getTournResultSets',
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
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['invite', 'public', 'results', 'pairings'],
};

router.route('/:resultSetId').get(controller.getResultSet).openapi = {
	path: '/rest/tourns/{tournId}/results/{resultSetId}',
	summary     : 'Returns result information given a result set ID if it is public',
	operationId : 'getResultSet',
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
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['invite', 'public', 'results', 'pairings'],
};

router.route('/event/:eventId').get(controller.getResultSets).openapi = {
	path: '/rest/tourns/{tournId}/results/event/{eventId}',
	summary     : 'Returns public result information for a given event',
	operationId : 'getEventResultSets',
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
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['invite', 'public', 'results', 'pairings'],
};

export default router;