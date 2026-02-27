import { Router } from 'express';
import * as inviteController from '../../../../controllers/pages/invite/inviteController.js';
import * as schematController from '../../../../controllers/pages/invite/schematController.js';

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
	summary: 'Get Schematic Data for a Published Round',
	description: 'Gives everything needed for a public round display',
	tags: ['Invite', 'Public', 'Schematic', 'Round'],
	responses: {
		200: {
			description: 'Round Information',
		},
	},
};

export default router;
