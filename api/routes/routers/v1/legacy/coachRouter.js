import { Router } from 'express';
import { updateContact, deleteContact, userProfile } from '../../../../controllers/coach/contacts.js';

const router = Router();

// /coach/{chapterId}/school/{schoolId}/updateContact
router.post('/:chapterId/school/:schoolId/updateContact', updateContact).openapi = {
	path: '/coach/{chapterId}/school/{schoolId}/updateContact',
	tags: ['legacy', 'Coach'],
	parameters: [
		{ in: 'path', name: 'chapterId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'schoolId', required: true, schema: { type: 'integer' } },
	],
	responses: { 200: { description: 'Contact updated' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
// /coach/{chapterId}/school/:schoolId/deleteContact
router.post('/:chapterId/school/:schoolId/deleteContact', deleteContact).openapi = {
	path: '/coach/{chapterId}/school/{schoolId}/deleteContact',
	tags: ['legacy', 'Coach'],
	parameters: [
		{ in: 'path', name: 'chapterId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'schoolId', required: true, schema: { type: 'integer' } },
	],
	responses: { 200: { description: 'Contact deleted' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
// /person/{personId}
router.get('/person/:personId', userProfile).openapi = {
	path: '/coach/person/{personId}',
	tags: ['legacy', 'Coach'],
	parameters: [{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } }],
	responses: { 200: { description: 'User profile' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
// /person
router.get('/person', userProfile).openapi = {
	path: '/coach/person',
	tags: ['legacy', 'Coach'],
	responses: { 200: { description: 'User profiles' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};

export default router;
