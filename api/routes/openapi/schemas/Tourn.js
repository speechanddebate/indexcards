export const Tourn = {
	type : 'object',
	description: 'A tournament',
	properties: {
		id: {
			type: 'integer',
			description: 'The unique identifier for the tournament',
			readOnly: true,
			example: 123,
		},
		name: {
			type: 'string',
			description: 'The name of the tournament',
			example: 'National Speech & Debate Tournament',
		},
		city: {
			type: 'string',
			description: 'The city where the tournament is held',
			example: 'Phoenix/Mesa',
		},
		state: {
			type: 'string',
			description: 'The state where the tournament is held',
			example: 'AZ',
		},
		country: {
			type: 'string',
			description: 'The country where the tournament is held',
			example: 'US',
		},
		tz: {
			type: 'string',
			description: 'The IANA timezone of the tournament location',
			example: 'America/Chicago',
		},
		webName: {
			type: 'string',
			description: 'The web name of the tournament',
			example: 'nationals',
		},
		start: {
			type: 'string',
			format: 'date-time',
			description: 'The start date and time of the tournament',
			example: '2023-06-11T15:00:00.000Z',
		},
		end: {
			type: 'string',
			format: 'date-time',
			description: 'The end date and time of the tournament',
			example: '2023-06-17T05:00:00.000Z',
		},
		regStart: {
			type: 'string',
			format: 'date-time',
			description: 'The registration start date and time of the tournament',
			example: '2023-03-15T13:00:00.000Z',
		},
		regEnd: {
			type: 'string',
			format: 'date-time',
			description: 'The registration end date and time of the tournament',
			example: '2023-06-02T06:59:00.000Z',
		},
	},
};
export const TournContact = {
	type : 'object',
	description: 'A tournament contact person',
	properties: {
		id: {
			type: 'integer',
			description: 'The unique identifier for the contact person',
			readOnly: true,
			example: 456,
		},
		first: {
			type: 'string',
			description: 'The first name of the contact person',
			example: 'John',
		},
		middle: {
			type: 'string',
			nullable: true,
			description: 'The middle name of the contact person',
			example: 'A.',
		},
		last: {
			type: 'string',
			description: 'The last name of the contact person',
			example: 'Doe',
		},
		email: {
			type: 'string',
			format: 'email',
			description: 'The email address of the contact person',
			example: 'johndoe@example.com',
		},
	},
};