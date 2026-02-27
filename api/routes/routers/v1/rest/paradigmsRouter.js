import controller from '../../../../controllers/rest/paradigmsController.js';
import { requireLogin } from '../../../../middleware/authorization/authorization.js';
import { Router } from 'express';

const router = Router();

//searching paradigms requires a user to be logged in
router.use(requireLogin);

router.route('/').get(controller.getParadigms).openapi = {
	path: '/rest/paradigms',
	summary: 'Search paradigms',
	operationId: 'searchParadigms',
	tags: ['Paradigms'],
	parameters: [
		{
			name: 'search',
			in: 'query',
			description: 'Search query for paradigms',
			required: true,
			schema: {
				type: 'string',
			},
		},
		{
			name: 'limit',
			in: 'query',
			description: 'Maximum number of paradigms to return',
			required: false,
			schema: {
				type: 'integer',
				minimum: 1,
				default: 50,
				maximum: 100,
			},
		},
		{
			name: 'offset',
			in: 'query',
			description: 'Number of paradigms to skip before starting to return results',
			required: false,
			schema: {
				type: 'integer',
				minimum: 0,
				default: 0,
			},
		},
	],
	responses: {
		200: {
			description: 'List of paradigms matching the search query',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								id: { type: 'integer' },
								name: { type: 'string', description: 'Full name' },
								tournJudged: { type: 'integer', description: 'Number of tournaments judged' },
								schools: {
									type: 'array',
									items: {
										type: 'object',
										properties: {
											id: { type: 'integer' },
											name: { type: 'string' },
										},
									},
								},
							},
						},
					},
				},
			},
		},
	},
};
router.route('/:personId').get(controller.getParadigmByPersonId).openapi = {
	path: '/rest/paradigms/{personId}',
	summary: 'Get paradigm details by person ID',
	operationId: 'getParadigmByPersonId',
	tags: ['Paradigms'],
	parameters: [
		{
			name: 'personId',
			in: 'path',
			description: 'ID of the person to retrieve paradigm details for',
			required: true,
			schema: {
				type: 'integer',
			},
		},
	],
	responses: {
		200: {
			description: 'Paradigm details for the specified person ID',
			content: {
				'application/json': {
					schema: {'$ref': '#/components/schemas/ParadigmDetails'},
				},
			},
		},
		404: { $ref: '#/components/responses/NotFound' },
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

export default router;