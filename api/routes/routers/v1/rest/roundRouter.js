import { Router } from 'express';
import * as controller from '../../../../controllers/rest/roundController.js';

const router = Router({ mergeParams: true });

// Bolted onto /tourns/:tournId/rounds

// NAMING CONVENTION:
// schemats == round assignments and pairings
// results  == round outcomes and scores
// brackets == primary results data up to this round
// records  == both!

router.route('/').get(controller.getPublishedRounds).openapi = {
	path: '/rest/tourns/{tournId}/rounds',
	summary: 'Get Tourn Published Rounds',
	description: 'Retrieve a list of published rounds for an entire tournament.',
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

router.route('/:roundId').get(controller.getPublishedRound).openapi = {
	path: '/rest/tourns/{tournId}/rounds/{roundId}',
	summary     : 'Returns a single Round object an ID if it is published',
	operationId : 'getRound',
	responses: {
		200: {
			description: 'Object of Round with public information on it',
			content: {
				'application/json': {
					schema: {
						type: 'object', // There is a schemat for it somewhere...urk.
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['invite', 'public', 'schematics', 'rounds', 'pairings'],
};

router.route('/:roundId/schematic').get(controller.getPublishedSchematic).openapi = {
	path        : '/rest/tourns/{tournId}/rounds/{roundId}/schematic',
	summary     : 'Returns public round information necessary to create a full schematic',
	operationId : 'getSchematic',
	responses: {
		200: {
			description: `Object of Round with public information on it for a schematic,
			 		which includes a list of entries or sections as appropriate.`,
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

router.route('/:roundId/brackets').get(controller.getPublishedBrackets).openapi = {
	path        : '/rest/tourns/{tournId}/rounds/{roundId}/brackets',
	summary     : 'Get published primary results data leading up to this round for brackets',
	description : 'Gets the outcome scores of the present round if published',
	tags        : ['Events', 'Results', 'Records', 'Entries'],
	responses :{
		200             : {
			description : 'Entries with Win Loss data attached',
		},
		404: {
			$ref: '#/components/responses/NotFound',
		},
	},
};

router.route('/:roundId/results').get(controller.getPublishedResults).openapi = {
	path        : '/rest/tourns/{tournId}/rounds/{roundId}/results',
	summary     : 'Get Published Results for a Round',
	description : 'Gets the outcome scores of the present round if published',
	tags        : ['Events', 'Results', 'Records', 'Entries'],
	responses :{
		200             : {
			description : 'Entries with Win Loss data attached',
		},
		404: {
			$ref: '#/components/responses/NotFound',
		},
	},
};

export default router;