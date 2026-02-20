import { Router } from 'express';
import { Backup } from '../../../../../controllers/tab/tourn/backup.js';
import tournController from '../../../../../controllers/tab/tournsController.js';
import categoriesRouter from './categoriesRouter.js';
import schoolsRouter from './schoolsRouter.js';
import sitesRouter from './sitesRouter.js';
import timeslotsRouter from './timeslotsRouter.js';
import { loadTournAuthContext } from '../../../../../middleware/authorization/authContext.js';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';

import legacyAllRouter from './legacy/allRouter.js';
import legacyRoundRouter from './legacy/roundRouter.js';

const router = Router({mergeParams: true });

router.param('tournId', loadTournAuthContext);

router.route('/').post(tournController.createTourn).openapi = {
	path: '/tab/tourns',
	summary: 'Create tournament',
	tags: ['Tournament'],
	requestBody: {
		content: {
			'application/json': {
				schema: {
					$ref: '#/components/schemas/TournRequest',
				},
			},
		},
		required: true,
	},
	responses: {
		201: {
			description: 'Tournament created',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/Tourn',
					},
				},
			},
		},
	},
};

router.route('/:tournId').get(requireAccess('tourn', 'read'), tournController.getTourn).openapi = {
	path: '/tab/tourns/{tournId}',
	summary: 'Get tournament',
	tags: ['Tournament'],
	responses: {
		200: {
			description: 'Tournament information',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/Tourn',
					},
				},
			},
		},
		404: { $ref: '#/components/responses/NotFound' },
	},
};

router.route('/:tournId').put(requireAccess('tourn', 'update'), tournController.updateTourn).openapi = {
	path: '/tab/tourns/{tournId}',
	summary: 'Update tournament',
	tags: ['Tournament'],
};

router.route('/:tournId').delete(requireAccess('tourn', 'owner'), tournController.deleteTourn).openapi = {
	path: '/tab/tourns/{tournId}',
	summary: 'Delete tournament',
	tags: ['Tournament'],
};

router.route('/:tournId/backup').post(requireAccess('tourn', 'read'), Backup).openapi = {
	path: '/tab/tourns/{tournId}/backup',
	summary: 'Tournament Backup',
	description: 'Creates a backup dump of the tournament data in JSON format',
	tags: ['Backup and Restore'],
	parameters: [
		{
			in: 'path',
			name: 'tournId',
			required: true,
			schema: { type: 'integer' },
		},
	],
	requestBody: {
		description: 'Parameters for the backup request',
		required: true,
		content: {
			'application/json': {
				schema: {
					$ref: '#/components/schemas/BackupRequest',
				},
			},
		},
	},
	responses: {
		200: { description: 'Backup data' },
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

router.use('/:tournId/categories', categoriesRouter);
router.use('/:tournId/schools', schoolsRouter);
router.use('/:tournId/sites', sitesRouter);
router.use('/:tournId/timeslots', timeslotsRouter);

router.use('/:tournId/all', legacyAllRouter);
router.use('/:tournId/rounds', legacyRoundRouter);

export default router;