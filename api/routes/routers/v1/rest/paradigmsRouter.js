import controller from '../../../../controllers/rest/paradigmsController.js';
import { Router } from 'express';

const router = Router();

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
								chapters: {
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
		default: { $ref: '#/components/responses/ErrorResponse' },
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
					schema: {
						type: 'object',
						properties: {
							id: { type: 'integer' },
							name: { type: 'string', description: 'Full name' },
							paradigm: { type: 'string', description: 'Paradigm content' },
						},
					},
				},
			},
		},
		404: { $ref: '#/components/responses/NotFoundResponse' },
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

export default router;