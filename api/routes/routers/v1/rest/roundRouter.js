import { Router } from 'express';
import * as controller from '../../../../controllers/rest/roundController.js';

const router = Router({ mergeParams: true });

// Bolted onto /tourns/:tournId/rounds

router.route('/').get(controller.getPublishedRounds).openapi = {
	path: '/rest/tourns/{tournId}/rounds',
	summary: 'Get Published Rounds',
	description: 'Retrieve a list of published rounds for a specific tournament.',
	tags: ['Tournaments', 'Rounds'],
	responses: {
		200: {
			description: 'List of published rounds',
		},
		404: {
			$ref: '#/components/responses/NotFound',
		},
	},
};

router.route('/:roundId').get(controller.getRound).openapi = {
	path: '/rest/tourns/{tournId}/rounds/{roundId}',
	summary     : 'Returns round information given an ID if it is public',
	operationId : 'getRound',
	responses: {
		200: {
			description: 'Object of Round with public information on it',
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
	tags: ['invite', 'public', 'schematics', 'rounds', 'pairings'],
};

router.route('/:roundId/schematic').get(controller.getSchematic).openapi = {
	path: '/rest/tourns/{tournId}/rounds/{roundId}/schematic',
	summary     : 'Returns public round information necessary to create a full schematic',
	operationId : 'getSchematic',
	responses: {
		200: {
			description: 'Object of Round with public information on it for a schematic, which includes a list of entries or sections as appropriate.',
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
	tags: ['invite', 'public', 'schematics', 'rounds', 'pairings'],
};

export default router;