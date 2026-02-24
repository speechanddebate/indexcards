import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';
import { restoreTourn } from '../../../../../controllers/tab/tourn/backup.js';
import * as accessController from '../../../../../controllers/tab/tourn/access.js';

import roundRouter from '../../tab/tourns/legacy/roundRouter.js';

const router = Router({ mergeParams: true });

//router.post('/backup', backupTourn); moved to new router
router.post('/:tournId/restore', requireAccess('tourn', 'write'), restoreTourn).openapi = {
	path: '/tab/{tournId}/restore',
	summary: 'Restore tournament from backup',
	tags: ['legacy', 'Tournament'],
	parameters: [{ in: 'path', name: 'tournId', required: true, schema: { type: 'integer' } }],
	requestBody: {
		description: 'Tournament backup data',
		required: true,
		content: { 'application/json': { schema: { type: 'object' } } },
	},
	responses: { 200: { description: 'Tournament restored' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};

router.route('/:tournId/access/:personId')
    .get(requireAccess('tourn', 'read'), accessController.getAccess)
    .post(requireAccess('tourn', 'write'), accessController.createAccess)
    .put(requireAccess('tourn', 'write'), accessController.updateAccess)
    .delete(requireAccess('tourn', 'write'), accessController.deleteAccess);

router.route('/:tournId/access/:personId').get(accessController.getAccess).openapi = {
	path: '/tab/{tournId}/access/{personId}',
	tags: ['legacy', 'Tournament Access'],
	parameters: [
		{ in: 'path', name: 'tournId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } },
	],
	responses: { 200: { description: 'Access info' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.route('/:tournId/access/:personId').post(accessController.createAccess).openapi = {
	path: '/tab/{tournId}/access/{personId}',
	tags: ['legacy', 'Tournament Access'],
	parameters: [
		{ in: 'path', name: 'tournId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } },
	],
	responses: { 201: { description: 'Access created' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.route('/:tournId/access/:personId').put(accessController.updateAccess).openapi = {
	path: '/tab/{tournId}/access/{personId}',
	tags: ['legacy', 'Tournament Access'],
	parameters: [
		{ in: 'path', name: 'tournId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } },
	],
	responses: { 200: { description: 'Access updated' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.route('/:tournId/access/:personId').delete(accessController.deleteAccess).openapi = {
	path: '/tab/{tournId}/access/{personId}',
	tags: ['legacy', 'Tournament Access'],
	parameters: [
		{ in: 'path', name: 'tournId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } },
	],
	responses: { 200: { description: 'Access deleted' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};

router.route('/:tournId/backupAccess/:personId')
	.post(requireAccess('tourn', 'write'), accessController.createBackupAccess).openapi = {
		path: '/tab/{tournId}/backupAccess/{personId}',
		tags: ['legacy', 'Tournament Access'],
		parameters: [
			{ in: 'path', name: 'tournId', required: true, schema: { type: 'integer' } },
			{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } },
		],
		responses: { 201: { description: 'Backup access created' }, default: { $ref: '#/components/responses/ErrorResponse' } },
	}
	.delete(requireAccess('tourn', 'write'), accessController.deleteBackupAccess).openapi = {
		path: '/tab/{tournId}/backupAccess/{personId}',
		tags: ['legacy', 'Tournament Access'],
		parameters: [
			{ in: 'path', name: 'tournId', required: true, schema: { type: 'integer' } },
			{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } },
		],
		responses: { 200: { description: 'Backup access deleted' }, default: { $ref: '#/components/responses/ErrorResponse' } },
	};

router.use('/:tournId/rounds', roundRouter);

export default router;
