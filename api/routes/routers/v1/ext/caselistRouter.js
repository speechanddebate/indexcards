import { Router } from 'express';
import * as controller from '../../../../controllers/ext/caselistController.js';

const router = Router();

router.route('/chapters').get(controller.getPersonChapters).openapi = {
	path: '/ext/caselist/chapters',
	summary: 'Load chapters for a person ID',
	security: [{ extApiKey: [] }],
	tags: ['Ext : Caselist'],
	parameters: [
		{
			in: 'query',
			name: 'person_id',
			description: 'ID of person whose chapters you wish to access',
			required: true,
			schema: {
				type: 'integer',
				minimum: 1,
			},
		},
	],
	responses: {
		200: {
			description: 'Person Chapters',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/Chapter' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

router.route('/rounds').get(controller.getPersonRounds).openapi = {
	path: '/ext/caselist/rounds',
	summary: 'Load rounds for a person ID',
	security: [{ extApiKey: [] }],
	tags: ['Ext : Caselist'],
	parameters: [
		{
			in: 'query',
			name: 'person_id',
			description: 'Person ID to get rounds for',
			required: false,
			schema: {
				type: 'integer',
			},
		},
		{
			in: 'query',
			name: 'slug',
			description: 'Slug of page to match rounds',
			required: false,
			schema: {
				type: 'string',
			},
		},
		{
			in: 'query',
			name: 'current',
			description: 'Whether to return only current rounds',
			required: false,
			schema: {
				type: 'boolean',
			},
		},
	],
	responses: {
		200: {
			description: 'Person Rounds',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/Round' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

router.route('/students').get(controller.getPersonStudents).openapi = {
	path: '/ext/caselist/students',
	summary: 'Load students for a person ID',
	security: [{ extApiKey: [] }],
	tags: ['Ext : Caselist'],
	parameters: [
		{
			in: 'query',
			name: 'person_id',
			description: 'ID of person whose students you wish to access',
			required: true,
			schema: {
				type: 'integer',
				minimum: 1,
			},
		},
	],
	responses: {
		200: {
			description: 'Person Students',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/Student' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

router.route('/link').post(controller.postCaselistLink).openapi = {
	path: '/ext/caselist/link',
	summary: 'Create a link to a caselist page',
	security: [{ extApiKey: [] }],
	tags: ['Ext : Caselist'],
	requestBody: {
		description: 'The caselist link',
		required: true,
		content: { 'application/json': { schema: { $ref: '#/components/schemas/CaselistLink' } } },
	},
	responses: {
		200: {
			description: 'Caselist Link',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/CaselistLink' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

export default router;