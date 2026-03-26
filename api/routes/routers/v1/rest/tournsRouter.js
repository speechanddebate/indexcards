import { Router } from 'express';
import * as controller from '../../../../controllers/rest/tournsController.js';
import { requirePublicTourn } from '../../../../policy/tournPolicy.js';
import roundRouter from './roundRouter.js';
import eventRouter from './eventRouter.js';
import entryRouter from './entryRouter.js';

const router = Router({ mergeParams: true });

router.route('/').get(controller.getTourns).openapi = {
	path: '/rest/tourns',
	summary: 'Get Public Tournaments',
	operationId: 'RestTourns',
	description: 'Retrieve public information about tournaments.',
	tags: ['Tournaments','Orval'],
	parameters: [
		{
			name: 'circuit',
			in: 'query',
			required: false,
			schema: { type: 'integer' },
			description: 'Filter tournaments to those approved in this circuit.',
		},
		{
			name: 'startAfter',
			in: 'query',
			required: false,
			schema: { type: 'string', format: 'date-time' },
			description: 'Return tournaments with start date after this UTC timestamp.',
		},
		{
			name: 'startBefore',
			in: 'query',
			required: false,
			schema: { type: 'string', format: 'date-time' },
			description: 'Return tournaments with start date before this UTC timestamp.',
		},
		{
			name: 'fields',
			in: 'query',
			required: false,
			schema: { type: 'string' },
			description: 'Comma-separated tournament fields. Example: id,name,start',
		},
		{
			name: 'fields[events]',
			in: 'query',
			required: false,
			schema: { type: 'string' },
			description: 'Comma-separated event fields to include when requesting events.',
		},
	],
	responses: {
		200: {
			description: 'List of tournaments',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: {
							$ref: '#/components/schemas/Tourn',
						},
					},
				},
			},
		},
		404: {
			$ref: '#/components/responses/NotFound',
		},
	},
};

router.use('/:tournId', requirePublicTourn);

router.route('/:tournId').get(controller.getTourn).openapi = {
	path: '/rest/tourns/{tournId}',
	summary: 'Get Public Tournament',
	description: 'Retrieve public information about a specific tournament.',
	tags: ['Tournaments'],
	responses: {
		200: {
			description: 'Tournament information',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/Tourn',
					},
				},
			},
		},
		404: {
			$ref: '#/components/responses/NotFound',
		},
	},
};

router.use('/:tournId/rounds'  , roundRouter);
router.use('/:tournId/events'  , eventRouter);
router.use('/:tournId/entries' , entryRouter);

router.route('/:tournId/invite').get(controller.getTournInvite).openapi = {
	path: '/rest/tourns/{tournId}/invite',
	summary: 'Get Tournament Invite',
	operationId: 'getTournInvite',
	description: 'Retrieve a public invite for a specific tournament, including pages, files, events, and contacts.',
	tags: ['Tournaments','test'],
	responses: {
		200: {
			description: 'Public facing page data for a given tournament',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/TournInvite',
					},
				},
			},
		},
		401 : {
			$ref : '#/components/responses/Unauthorized',
		},
		404: {
			$ref: '#/components/responses/NotFound',
		},
		default: {
			$ref: '#/components/responses/ErrorResponse',
		},
	},
};

router.route('/:tournId/files').get(controller.getPublishedFiles).openapi = {
	path: '/rest/tourns/{tournId}/files',
	summary: 'Get Tournament Files',
	description: 'Retrieve a list of published files associated with a specific tournament.',
	tags: ['Tournaments'],
	responses: {
		200: {
			description: 'List of tournament files',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: {
							$ref: '#/components/schemas/File',
						},
					},
				},
			},
		},
		404: {
			$ref: '#/components/responses/NotFound',
		},
	},
};

router.route('/:tournId/schedule').get(controller.getSchedule).openapi = {
	path: '/rest/tourns/{tournId}/schedule',
	summary: 'Get tournament schedule',
	tags: ['Tournaments'],
	parameters: [
		{
			in: 'path',
			name: 'tournId',
			required: true,
			schema: { type: 'integer' },
		},
	],
	responses: {
		200: {
			description: 'Tournament schedule',
			content: {
				'application/json': {
					schema: { type: 'object' },
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

router.route('/:tournId/results').get(controller.getTournPublishedResults).openapi = {
	path: '/rest/tourns/{tournId}/results',
	summary: 'Returns an array of result_sets that are published in a tournament',
	operationId: 'getTournPublishedResults',
	tags: ['invite', 'public', 'results'],
	parameters: [
		{
			in: 'path',
			name: 'tournId',
			required: true,
			schema: { type: 'integer' },
		},
	],
	responses: {
		200: {
			description: 'Array of events',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: { type: 'object' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

export default router;