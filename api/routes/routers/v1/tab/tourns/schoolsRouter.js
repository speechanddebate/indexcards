import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';
import * as controller from '../../../../../controllers/tab/schoolController.js';

const router = Router({ mergeParams: true });

router.route('/').get( requireAccess('tourn', 'read'), controller.getSchools).openapi = {
	path: '/tab/tourns/{tournId}/schools',
	summary: 'Get Schools for Tournament',
	description: 'Retrieves all schools associated with the specified tournament.',
	tags: ['Schools'],
	responses: {
		200: {
			description: 'Schools retrieved successfully',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/School' },
					},
				},
			},
		},
		404 : { $ref: '#/components/responses/NotFound' },
	},
};

router.route('/').post(requireAccess('tourn', 'write'), controller.createSchool).openapi = {
	path: '/tab/tourns/{tournId}/schools',
	summary: 'Create School',
	description: 'Creates a new school within the specified tournament.',
	tags: ['Schools'],
	requestBody: {
		required: true,
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/CreateSchool' },
			},
		},
	},
	responses: {
		201: {
			description: 'School created successfully',
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							id: { type: 'integer', description: 'ID of the created school' },
						},
					},
				},
			},
		},
	},
};

router.route('/:schoolId').get(   requireAccess('tourn', 'read'),  controller.getSchool).openapi = {
	path: '/tab/tourns/{tournId}/schools/{schoolId}',
	summary: 'Get School by ID',
	description: 'Retrieves a school by its ID within the specified tournament.',
	tags: ['Schools'],
	responses: {
		200: {
			description: 'School retrieved successfully',
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/School' },
				},
			},
		},
		404 : { $ref: '#/components/responses/NotFound' },
	},
};

router.route('/:schoolId').put(   requireAccess('tourn', 'write'), controller.updateSchool).openapi = {
	path: '/tab/tourns/{tournId}/schools/{schoolId}',
	summary: 'Update School',
	description: 'Updates an existing school within the specified tournament.',
	tags: ['Schools'],
	requestBody: {
		required: true,
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/UpdateSchool' },
			},
		},
	},
	responses: {
		200: {
			description: 'School updated successfully',
		},
		404 : { $ref: '#/components/responses/NotFound' },
	},
};

router.route('/:schoolId').delete(requireAccess('tourn', 'write'), controller.deleteSchool).openapi = {
	path: '/tab/tourns/{tournId}/schools/{schoolId}',
	summary: 'Delete School',
	description: 'Deletes a school within the specified tournament.',
	tags: ['Schools'],
	responses: {
		204: {
			description: 'School deleted successfully',
		},
		404 : { $ref: '#/components/responses/NotFound' },
	},
};

export default router;