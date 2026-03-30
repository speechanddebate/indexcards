import { Router } from 'express';
import z from 'zod';
import { ValidateRequest } from '../../../middleware/validation.js';
import { requireLogin, requireSiteAdmin } from '../../../middleware/authorization/authorization.js';
import * as schemas from '../../openapi/schemas/index.js';
import * as examples from '../../openapi/examples/index.js';
import * as controller from '../../../controllers/authController.js';

const router = Router();

router.route('/login').post(ValidateRequest, controller.login).openapi = {
	path: '/auth/login',
	summary: 'Login',
	operationId: 'authLogin',
	description: 'Logs in a user and creates a session.',
	tags: ['Auth', 'Public', 'Orval'],
	security: [],
	requestBody: {
		required: true,
		content: {
			'application/json': {
				schema: schemas.LoginRequest,
				example: examples.LoginRequest,
			},
		},
	},
	responses: {
		'200': {
			description: 'Success',
			content: {
				'application/json': {
					schema: schemas.LoginResponse,
					example: examples.LoginResponse,
				},
			},
		},
	},
};

router.route('/logout').post(controller.logout).openapi = {
	path: '/auth/logout',
	summary: 'Logout',
	operationId: 'authLogout',
	description: 'Logs out the current user and invalidates the session.',
	tags: ['Auth', 'Orval'],
	responses: {
		'204': {
			description: 'No Content. Successfully logged out.',
		},
	},
};

router.route('/su').post(requireSiteAdmin, ValidateRequest, controller.su).openapi = {
	path: '/auth/su',
	summary: 'Start Su session',
	operationId: 'authSu',
	tags: ['Auth', 'Orval'],
	requestBody: {
		required: true,
		content: {
			'application/json': {
				schema: z.object({
					suId: z.int().positive(),
				}),
			},
		},
	},
	responses: {
		'204': {
			description: 'No Content. Successfully logged out.',
		},
		'400': { '$ref': '#/components/responses/BadRequest' },
	},
};
router.route('/suend').post(requireLogin, controller.suEnd).openapi = {
	path: '/auth/suend',
	summary: 'End Su session',
	operationId: 'authSuEnd',
	tags: ['Auth', 'Orval'],
	responses: {
		'204': {
			description: 'No Content. Successfully ended Su session.',
		},
		'400': { '$ref': '#/components/responses/BadRequest' },
	},
};

router.route('/register').post(ValidateRequest, controller.register).openapi = {
	path: '/auth/register',
	summary: 'Register',
	operationId: 'authRegister',
	description: 'Registers a new user.',
	tags: ['Auth', 'Orval'],
	security: [],
	requestBody: {
		required: true,
		content: {
			'application/json': {
				schema: schemas.RegisterRequest,
			},
		},
	},
};

export default router;