import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';
import { getAccess,createAccess,updateAccess,deleteAccess } from '../../../../../controllers/tab/category/access.js';
import { updateCategoryLearn } from '../../../../../controllers/tab/category/learn.js';
const router = Router();

router.route('/:categoryId/access/:personId')
	.all(requireAccess('category', 'write'))
    .get(getAccess)
    .put(updateAccess)
    .delete(deleteAccess)
    .post(createAccess);

router.route('/:categoryId/access/:personId').get(getAccess).openapi = {
	path: '/tab/category/{categoryId}/access/{personId}',
	tags: ['legacy', 'Category Access'],
	parameters: [
		{ in: 'path', name: 'categoryId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } },
	],
	responses: { 200: { description: 'Access info' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.route('/:categoryId/access/:personId').put(updateAccess).openapi = {
	path: '/tab/category/{categoryId}/access/{personId}',
	tags: ['legacy', 'Category Access'],
	parameters: [
		{ in: 'path', name: 'categoryId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } },
	],
	responses: { 200: { description: 'Access updated' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.route('/:categoryId/access/:personId').delete(deleteAccess).openapi = {
	path: '/tab/category/{categoryId}/access/{personId}',
	tags: ['legacy', 'Category Access'],
	parameters: [
		{ in: 'path', name: 'categoryId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } },
	],
	responses: { 200: { description: 'Access deleted' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.route('/:categoryId/access/:personId').post(createAccess).openapi = {
	path: '/tab/category/{categoryId}/access/{personId}',
	tags: ['legacy', 'Category Access'],
	parameters: [
		{ in: 'path', name: 'categoryId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } },
	],
	responses: { 201: { description: 'Access created' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.post('/:categoryId/updateLearn',requireAccess('category', 'write'), updateCategoryLearn).openapi = {
	path: '/tab/category/{categoryId}/updateLearn',
	tags: ['legacy', 'Category'],
	parameters: [{ in: 'path', name: 'categoryId', required: true, schema: { type: 'integer' } }],
	responses: { 200: { description: 'Learn courses updated' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};

export default router;
