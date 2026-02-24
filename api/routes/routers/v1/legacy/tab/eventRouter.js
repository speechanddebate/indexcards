import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';
import { updateEvent } from '../../../../../controllers/tab/event/index.js';
import { sectionTemplateRobin } from '../../../../../controllers/tab/event/roundrobin.js';
import * as accessController from '../../../../../controllers/tab/event/access.js';

const router = Router();

router.get('/:eventId', requireAccess('event', 'read'), updateEvent).openapi = {
	path: '/tab/event/{eventId}',
	tags: ['legacy', 'Event'],
	parameters: [{ in: 'path', name: 'eventId', required: true, schema: { type: 'integer' } }],
	responses: { 200: { description: 'Event' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};

router.route('/:eventId/access/:personId')
    .get(requireAccess('event', 'write'), accessController.getAccess)
    .put(requireAccess('event', 'write'), accessController.updateAccess)
    .delete(requireAccess('event', 'write'), accessController.deleteAccess)
    .post(requireAccess('event', 'write'), accessController.createAccess);

router.route('/:eventId/access/:personId').get(accessController.getAccess).openapi = {
	path: '/tab/event/{eventId}/access/{personId}',
	tags: ['legacy', 'Event Access'],
	parameters: [
		{ in: 'path', name: 'eventId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } },
	],
	responses: { 200: { description: 'Access info' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.route('/:eventId/access/:personId').put(accessController.updateAccess).openapi = {
	path: '/tab/event/{eventId}/access/{personId}',
	tags: ['legacy', 'Event Access'],
	parameters: [
		{ in: 'path', name: 'eventId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } },
	],
	responses: { 200: { description: 'Access updated' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.route('/:eventId/access/:personId').delete(accessController.deleteAccess).openapi = {
	path: '/tab/event/{eventId}/access/{personId}',
	tags: ['legacy', 'Event Access'],
	parameters: [
		{ in: 'path', name: 'eventId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } },
	],
	responses: { 200: { description: 'Access deleted' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.route('/:eventId/access/:personId').post(accessController.createAccess).openapi = {
	path: '/tab/event/{eventId}/access/{personId}',
	tags: ['legacy', 'Event Access'],
	parameters: [
		{ in: 'path', name: 'eventId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } },
	],
	responses: { 201: { description: 'Access created' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};

router.route('/:eventId/backupAccess/:personId')
	.post(requireAccess('event', 'write'), accessController.createBackupAccess).openapi = {
		path: '/tab/event/{eventId}/backupAccess/{personId}',
		tags: ['legacy', 'Event Access'],
		parameters: [
			{ in: 'path', name: 'eventId', required: true, schema: { type: 'integer' } },
			{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } },
		],
		responses: { 201: { description: 'Backup access created' }, default: { $ref: '#/components/responses/ErrorResponse' } },
	}
	.delete(requireAccess('event', 'write'), accessController.deleteBackupAccess).openapi = {
		path: '/tab/event/{eventId}/backupAccess/{personId}',
		tags: ['legacy', 'Event Access'],
		parameters: [
			{ in: 'path', name: 'eventId', required: true, schema: { type: 'integer' } },
			{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } },
		],
		responses: { 200: { description: 'Backup access deleted' }, default: { $ref: '#/components/responses/ErrorResponse' } },
	};

router.post('/:eventId/section/robin/template', requireAccess('event', 'write'), sectionTemplateRobin).openapi = {
	path: '/tab/event/{eventId}/section/robin/template',
	tags: ['legacy', 'Event'],
	parameters: [{ in: 'path', name: 'eventId', required: true, schema: { type: 'integer' } }],
	responses: { 200: { description: 'Round robin template section created' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};

export default router;
