export const LoginRequest = {
	type : 'object',
	description: 'A request to log in a user',
	additionalProperties: false,
	required: ['username', 'password'],
	properties : {
		username: {
			type : 'string',
			description: 'the username of the user',
		},
		password: {
			type : 'string',
			description: 'The hashed user password',
		},
	},
};
export const RegisterRequest = {
	type : 'object',
	description: 'A request to register a new user',
	additionalProperties: false,
	required: ['email', 'password', 'firstName', 'lastName'],
	properties : {
		email: {
			type : 'string',
			format: 'email',
			description: 'The email address of the new user',
		},
		password: {
			type : 'string',
			description: 'The password for the new user',
		},
		firstName: {
			type : 'string',
			description: 'The first name of the new user',
		},
		middleName: {
			type : 'string',
			description: 'The middle name of the new user',
		},
		lastName: {
			type : 'string',
			description: 'The last name of the new user',
		},
		phoneNumber: {
			type : 'string',
			description: 'The phone number of the new user',
		},
		state: {
			type : 'string',
			description: 'The 2 letter state code of the new user',
		},
		country: {
			type : 'string',
			description: 'The 2 letter country code of the new user',
		},
		tz: {
			type : 'string',
			description: 'The IANA timezone of the new user',
		},
	},
	examples: {
		example1: {
			email: 'john.doe@example.com',
			password: 'SecurePassw0rd!',
			firstName: 'John',
			middleName: 'A',
			lastName: 'Doe',
			phoneNumber: '555-123-4567',
			state: 'CA',
			country: 'US',
			tz: 'America/Chicago',
		},
	},
};