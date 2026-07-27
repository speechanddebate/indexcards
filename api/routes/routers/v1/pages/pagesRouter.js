import { Router } from 'express';
import * as inviteController from '../../../../controllers/pages/invite/inviteController.js';
import * as schematController from '../../../../controllers/pages/invite/schematController.js';
import * as pageResultController from '../../../../controllers/pages/invite/resultsController.js';
import * as resultSetController from '../../../../controllers/rest/resultSetController.js';
import z from 'zod';
import * as utils from '../../../openapi/schemas/utils.js';

import { ValidateRequest } from '../../../../middleware/validation.js';
const router = Router();

// These paths are bolted onto /v1/pages

router.route('/invite/nsdaCategories').get(inviteController.getNSDACategories).openapi = {
	path: '/pages/invite/nsdaCategories',
	summary: 'Get NSDA Event Categories',
	description: 'Retrieve a list of NSDA event categories.',
	tags: ['Invite', 'Public'],
	responses: {
		200: {
			description: 'List of NSDA event categories',
		},
	},
};

router.route('/invite/upcoming').get(inviteController.getFutureTourns).openapi = {
	path: '/pages/invite/upcoming',
	summary     : 'Returns the public listing of upcoming tournaments',
	responses   : {
		200: {
			description: 'List of public upcoming tournaments',
			content: { 'application/json': { schema: { $ref: '#/components/schemas/Tourn' } } },
		},
	},
	tags: ['futureTourns', 'invite', 'public'],
};

router.route('/invite/:circuit').get(inviteController.getFutureTourns).openapi = {
	path: '/pages/invite/{circuit}',
	summary     : 'Returns the public listing of upcoming tournaments',
	responses   : {
		200: {
			description: 'List of public upcoming tournaments',
			content: { 'application/json': { schema: { $ref: '#/components/schemas/Tourn' } } },
		},
	},
	tags: ['futureTourns', 'invite', 'public'],
};

router.route('/invite/nextweek').get(inviteController.getThisWeekTourns).openapi = {
	path: '/pages/invite/nextweek',
	summary	 : 'Returns the public listing of upcoming tournaments in this week',
	operationId : 'listWeeksTourns',
	responses: {
		200: {
			description: "List of this week's tournaments, with some stats",
			content: { 'application/json': { schema: { $ref: '#/components/schemas/Tourn' } } },
		},
	},
	tags: ['invite', 'public'],
};

router.route('/invite/webname/:webname').get(inviteController.getTournIdByWebname).openapi = {
	path: '/pages/invite/webname/{webname}',
	summary: 'Get Tournament ID by Webname',
	description: 'Retrieve the tournament ID and details by webname.',
	tags: ['Invite', 'Public'],
	responses: {
		200: {
			description: 'Tournament information',
		},
	},
};

router.route('/invite/:tournId/').get(inviteController.getTournIdByWebname).openapi = {
	path: '/pages/invite/webname/{webname}',
	summary: 'Get Tournament ID by Webname',
	description: 'Retrieve the tournament ID and details by webname.',
	tags: ['Invite', 'Public'],
	responses: {
		200: {
			description: 'Tournament information',
		},
	},
};

router.route('/invite/:tournId/:eventAbbr/:roundName').get(schematController.getSchematic).openapi = {
	path: '/pages/invite/{tournId}/{eventAbbr}/{roundName}',
	summary: 'Round Schematic',
	description: 'Gives data for the display of a public round schematic',
	tags: ['Invite', 'Public', 'Schematic', 'Round'],
	responses: {
		200: {
			description: 'Round Information',
		},
	},
};

router.route('/invite/:tournId/:eventAbbr/:roundName/results').get(ValidateRequest, pageResultController.getRoundResults).openapi = {
	path        : '/pages/invite/{tournId}/{eventAbbr}/{roundName}',
	summary     : 'Round published results',
	description : 'Returns results display information for a given round',
	operationId : 'getRoundPublicResults',
	requestParams: {
		path: z.object({
			tournId   : utils.id.meta({ description: 'ID of the tournament to get results for' }),
			eventAbbr : z.string().meta({ description: 'Event Abbreviation of the round' }),
			roundName : z.coerce.number().meta({ description: 'Number of the round' }),
		}),
	},
	responses: {
		200: {
			description: 'Aggregated section data with results if they are public',
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

router.route('/tiebreaks/:roundId').get(resultSetController.getTiebreaks).openapi = {
	path: '/pages/tiebreaks/{roundId}',
	summary: 'Get tiebreaks needed for a protocol id.  This is just for Palmer testing and will go poof.',
	description: 'for testing and dev',
	tags: ['Invite', 'Public', 'Schematic', 'Round'],
	responses: {
		200: {
			description: 'Round Information',
		},
	},
};

router.route('/protocol/round/:roundId').get(resultSetController.getTiebreaks).openapi = {
	path: '/pages/protocol/round/{roundId}',
	summary: 'Get tiebreaks needed for a protocol id',
	description: 'for testing and dev',
	tags: ['Invite', 'Public', 'Schematic', 'Round'],
	responses: {
		200: {
			description: 'Round Information',
		},
	},
};

export default router;
