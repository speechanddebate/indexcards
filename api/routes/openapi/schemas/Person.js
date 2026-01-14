export const Person = {
	type : 'object',
	description: 'A person (user) in tabroom',
	additionalProperties: false,
	properties : {
		id: {
			type: 'integer',
			example: 42,
		},
		email: {
			type: 'string',
			format: 'email',
			example: 'johndoe@tabroom.com',
		},
	},
};