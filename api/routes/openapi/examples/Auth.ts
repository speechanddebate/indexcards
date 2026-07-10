import type { z } from 'zod';
import {
	LoginRequest as LoginRequestSchema,
	LoginResponse as LoginResponseSchema,
} from '../schemas/Auth.js';

export const LoginRequest = {
	username: 'johndoe@tabroom.com',
	password: 'password123',
} satisfies z.input<typeof LoginRequestSchema>;
export const LoginResponse = {
	token: 'example-token',
	Person: {
		id: 1,
		email: 'johndoe@tabroom.com',
	},
} satisfies z.output<typeof LoginResponseSchema>;