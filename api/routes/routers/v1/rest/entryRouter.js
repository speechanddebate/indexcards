import { Router } from 'express';
import * as controller from '../../../../controllers/rest/entryController.js';
import z from 'zod';
import * as utils from '../../../openapi/schemas/utils.ts';

import { ValidateRequest } from '../../../../middleware/validation.js';

const router = Router({ mergeParams: true });
// Bolted onto /tourns/:tournId/entries/:entryId

// NAMING CONVENTION:
// schemats == round assignemnts and pairings
// results == round outcomes and scores
// records == both!

router.route('/:entryId/records').get(ValidateRequest, controller.getEntryRecords).openapi = {
	path        : '/rest/tourns/{tournId}/entries/{entryId}/records',
	summary     : 'Entry Tournament Records',
	description : 'Shows the published available pairings and results data for a given entry',
	tags        : ['Tournaments', 'Entries', 'Results', 'Schematics'],
	requestParams: {
		path: z.object({entryId: utils.id }),
	},
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