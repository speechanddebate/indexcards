import { Router } from 'express';
import * as c from '../../../../controllers/rest/circuitsController.js';
import { restCircuit } from '../../../openapi/schemas/Circuit.js';
import { ValidateRequest } from '../../../../middleware/validation.js';
import z from 'zod';

const router = Router();
router.route('/active').get(c.activeCircuits).openapi = {
	path: '/rest/circuits/active',
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
						type: 'array',
						items: {
							type: 'object',
							properties: {
								id: { type: 'integer' },
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
	},
};
router.route('/:circuitId').get(ValidateRequest, c.getCircuit).openapi = {
	path: '/rest/circuits/{circuitId}',
	summary: 'get a circuit',
	description: 'gets a circuit by ID',
	operationId: 'RestCircuit',
	tags: ['Circuits', 'Orval'],
	requestParams: {
		path: z.object({ circuitId: z.coerce.number().positive() }),
	},
	responses: {
		200: {
			description: 'Circuit details',
			content: {
				'application/json': {
					schema: restCircuit,
				},
			},
		},
		404: {
			description: 'Circuit not found',
		},
	},
};

export default router;