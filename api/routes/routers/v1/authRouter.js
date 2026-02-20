import { Router } from 'express';
import * as controller from '../../../controllers/authController.js';

const router = Router();

router.route('/login').post(controller.login).openapi = {
	path: '/auth/login',
	summary: 'Login',
	operationId: 'login',
	description: 'Logs in a user and creates a session.',
	tags: ['Auth', 'Public'],
	security: [],
	requestBody: {
		required: true,
		content: {
			'application/json': {
				schema: {
					$ref: '#/components/schemas/LoginRequest',
				},
			},
		},
	},
};

router.route('/logout').post(controller.logout).openapi = {
	path: '/auth/logout',
	summary: 'Logout',
	operationId: 'logout',
	description: 'Logs out the current user and invalidates the session.',
	tags: ['Auth'],
};

router.route('/register').post(controller.register).openapi = {
	path: '/auth/register',
	summary: 'Register',
	operationId: 'register',
	description: 'Registers a new user.',
	tags: ['Auth'],
	security: [],
	requestBody: {
		required: true,
		content: {
			'application/json': {
				schema: {
					$ref: '#/components/schemas/RegisterRequest',
				},
			},
		},
	},
};

export default router;