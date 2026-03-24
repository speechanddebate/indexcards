import { Router } from 'express';
import * as schemas from '../../openapi/schemas/index.js';
import * as examples from '../../openapi/examples/index.js';
import * as controller from '../../../controllers/authController.js';

const router = Router();

router.route('/login').post(controller.login).openapi = {
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
};

router.route('/register').post(controller.register).openapi = {
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