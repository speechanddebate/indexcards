import { Router } from 'express';
import { activeCircuits } from '../../../../controllers/rest/circuitsController.js';

const router = Router();

router.route('/active').get(activeCircuits).openapi = {
	path: 'rest/circuits/active',
	summary: 'get active circuits',
	description: 'gets the active circuits for the current school year',
	operationId: 'restCircuitsActive',
	tags: ['Circuits', 'Orval'],
	parameters: [
		{
			name: 'state',
			in: 'query',
			required: false,
			schema: { type: 'string', maxLength: 2 },
			description: '2-character state code to filter circuits',
		},
		{
			name: 'country',
			in: 'query',
			required: false,
			schema: { type: 'string', maxLength: 2 },
			description: '2-character country code to filter circuits',
		},
	],
	responses: {
		200: {
			description: 'Active circuits',
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							id: { type: 'int' },
							abbr: { type: 'string' },
							name: { type: 'string' },
							state: { type: 'string' },
							country: { type: 'string' },
							tournCount: { type: 'integer' },
						},
					},
				},
			},
		},
	},
};

export default router;