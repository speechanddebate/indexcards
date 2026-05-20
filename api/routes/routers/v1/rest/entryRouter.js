import { Router } from 'express';
import * as controller from '../../../../controllers/rest/entryController.js';

const router = Router({ mergeParams: true });
// Bolted onto /tourns/:tournId/entries/:entryId

// NAMING CONVENTION:
// schemats == round assignemnts and pairings
// results == round outcomes and scores
// records == both!

router.route('/:entryId/records').get(controller.getEntryRecords).openapi = {
	path        : '/rest/tourns/{tournId}/entries/{entryId}/records',
	summary     : 'Get Tournament Records for a given Entry',
	description : 'Shows the published available results data for a given entry',
	tags        : ['Tournaments', 'Entries', 'Results'],
	parameters  : [
		{
			name        : 'tournId',
			in          : 'path',
			required    : true,
			schema      : { type: 'integer' },
			description : 'ID of the tournament',
		},
		{
			name        : 'entryId',
			in          : 'path',
			required    : true,
			schema      : { type:'integer' },
			description : 'ID of the entry',
		},
	],
	responses: {
		200: {
			description: 'Record of results of a given entry',
		},
		404: {
			$ref: '#/components/responses/NotFound',
		},
	},
};

export default router;