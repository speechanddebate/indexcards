import { Router } from 'express';
import * as controller from '../../../../controllers/rest/eventController.js';

const router = Router({ mergeParams: true });
// Bolted onto /tourns/:tournId/events

// NAMING CONVENTION:
// field      == list of entries in that event and public info thereon.
// schemats   == round assignments and pairings
// results    == round outcomes and scores
// resultSets == calculated tables of results
// brackets   == primary results data up to this round
// records    == both schematis and results in one big ol blob of fun.

router.route('/').get(controller.getEvents).openapi = {
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

router.route('/:eventId/results').get(controller.getResults).openapi = {
	path        : '/rest/tourns/{tournId}/events/{eventId}/entryWins',
	summary     : 'Get Published Results by Event',
	description : 'Given an Event ID, get published result records of the entries therein',
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

router.route('/:eventAbbr/field').get(controller.getField).openapi = {
	path: '/rest/tourns/{tournId}/events/{eventAbbr}/field',
	summary: 'Get Entry Field by Event',
	description: 'Retrieve entries in the field for a specific event.',
	tags: ['Events'],
	parameters: [
		{
			in       : 'path',
			name     : 'tournId',
			required : true,
			schema   : { type: 'integer' },
		},{
			in       : 'path',
			name     : 'eventAbbr',
			required : true,
			schema   : { type: 'string' },
		},
	],
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
// Need to distinguish this from a normal request by event ID which will be needed
router.route('/byAbbr/:eventAbbr').get(controller.getEventByAbbr).openapi = {
	path        : '/rest/tourns/{tournId}/events/byAbbr/{eventAbbr}',
	summary     : 'Get Event and Round List by Abbr',
	description : 'Returns Event object with list of published rounds given an event abbreviation',
	operationId : 'getEventByAbbr',
	responses: {
		200: {
			description: 'Event and Round List',
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