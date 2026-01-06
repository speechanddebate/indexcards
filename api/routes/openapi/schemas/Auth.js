export const LoginRequest = {
	type : 'object',
	description: 'A request to log in a user',
	additionalProperties: false,
	required: ['username', 'password'],
	properties : {
		username: {
			type : 'string',
			description: 'the username of the user',
			example: 'johndoe',
		},
		password: {
			type : 'string',
			description: 'The hashed user password',
			example: 'secret123',
		},
	},
};