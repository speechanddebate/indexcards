import * as z from 'zod';

export const LoginRequest = z.object({
	username: z.string().meta({
		description: 'The username of the user',
	}),
	password: z.string().meta({
		description: 'The password of the user',
	}),
}).meta({
	id: 'LoginRequest',
	description: 'A request to log in a user',
});

export const LoginResponse = z.object({
	token: z.string(),
	Person: z.object({
		id: z.int(),
		email: z.string(),
	}),
}).meta({
	id: 'LoginResponse',
	description: 'A response for a login request',
});

export const RegisterRequest = z.object({
	email: z.email().meta({
		description: 'The email address of the new user',
	}),
	password: z.string().meta({
		description: 'The password for the new user',
	}),
	firstName: z.string().meta({
		description: 'The first name of the new user',
	}),
	middleName: z.string().nullable().meta({
		description: 'The middle name of the new user',
	}),
	lastName: z.string().meta({
		description: 'The last name of the new user',
	}),
	phoneNumber: z.string().nullable().meta({
		description: 'The phone number of the new user',
	}),
	state: z.string().nullable().meta({
		description: 'The 2 letter state code of the new user',
		example: 'IA',
	}),
	country: z.string().nullable().meta({
		description: 'The 2 letter country code of the new user',
		example: 'US',
	}),
	tz: z.string().nullable().meta({
		description: 'The IANA timezone of the new user',
	}),

}).meta({
	id: 'RegisterRequest',
	description: 'A request to register a new user',
});