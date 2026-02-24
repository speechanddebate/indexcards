import { Router } from 'express';
import controller from '../../../../../controllers/tab/categoryController.js';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';

const router = Router({ mergeParams: true });

router.route('/').get(requireAccess('tourn', 'read'), controller.getCategories).openapi = {
	path: '/tab/tourns/{tournId}/categories',
	summary: 'Get categories',
	tags: ['Category'],
	responses: {
		200: {
			description: 'List of categories',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/Category' },
					},
				},
			},
		},
	},
};

router.route('/').post(requireAccess('tourn', 'write'), controller.createCategory).openapi = {
	path: '/tab/tourns/{tournId}/categories',
	summary: 'Create category',
	tags: ['Category'],
};

router.route('/:categoryId').get(requireAccess('category', 'read'), controller.getCategory).openapi = {
	path: '/tab/tourns/{tournId}/categories/{categoryId}',
	summary: 'Get category',
	tags: ['Category'],
	responses: {
		200: {
			description: 'Category details',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/Category',
					},
				},
			},
		},
		404: {$ref: '#/components/responses/NotFound'},
	},
};

router.route('/:categoryId').delete(requireAccess('category', 'write'), controller.deleteCategory).openapi = {
	path: '/tab/tourns/{tournId}/categories/{categoryId}',
	summary: 'Delete category',
	tags: ['Category'],
};

router.route('/:categoryId').put(requireAccess('category', 'write'), controller.updateCategory).openapi = {
	path: '/tab/tourns/{tournId}/categories/{categoryId}',
	summary: 'Update category',
	tags: ['Category'],
};

export default router;