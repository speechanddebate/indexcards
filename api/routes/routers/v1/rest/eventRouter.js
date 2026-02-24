import { Router } from 'express';
import * as controller from '../../../../controllers/rest/eventController.js';

const router = Router({ mergeParams: true });
// Bolted onto /tourns/:tournId/events

router.route('/').get(controller.getTournEvents).openapi = {
	path: '/rest/tourns/{tournId}/events',
	summary: 'Get Tournament Events',
	description: 'Retrieve a list of events associated with a specific tournament.',
	tags: ['Tournaments'],
	responses: {
		200: {
			description: 'List of tournament events',
		},
		404: {
			$ref: '#/components/responses/NotFound',
		},
	},
};

router.route('/:eventAbbr/field').get(controller.getEntryFieldByEvent).openapi = {
	path: '/rest/tourns/{tournId}/events/{eventAbbr}/field',
	summary: 'Get Entry Field by Event',
	description: 'Retrieve entries in the field for a specific event.',
	tags: ['Events'],
	responses: {
		200: {
			description: 'List of entries',
		},
		404: {
			$ref: '#/components/responses/NotFound',
		},
	},
};
// router.get('/:eventId', controller.getEventById);
// Need to distinguish this from a normal request by event ID which will be
// needed
router.route('/byAbbr/:eventAbbr').get(controller.getEventByAbbr).openapi = {
	path: '/rest/tourns/{tournId}/events/{eventAbbr}',
	summary     : 'Returns some limited data about an event together with published rounds by event abbreviation',
	operationId : 'getEventByAbbr',
	responses: {
		200: {
			description: 'Event and Round in JSON format for parsing',
			content: {
				'application/json': {
					schema: {
						type: 'object',
					},
				},
			},
		},
	},
	tags: ['invite', 'public', 'event', 'eventAbbr', 'rounds'],
};

export default router;