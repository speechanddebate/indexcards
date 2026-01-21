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

export const BackupRequest = {
	type: 'object',
	description: 'A request to create a backup for a tournament or part of a tournament',
	required: ['scope'],
	properties: {
		scope: {
			type: 'object',
			description: 'Defines what part of the tournament to back up',
			required: ['type'],
			properties: {
				type: {
					type: 'string',
					description: 'The scope of the backup',
					enum: ['tournament', 'category', 'event', 'school'],
				},
				id: {
					type: 'integer',
					description:
				'The ID of the category, event, or school being backed up (required when scope type is not "tournament")',
				},
			},
			additionalProperties: false,
		},

		options: {
			type: 'object',
			description: 'Optional flags that affect how the backup is generated',
			properties: {
				ignoreComments: {
					type: 'boolean',
					description: 'Exclude comments from the backup',
				},
				ignoreBallots: {
					type: 'boolean',
					description: 'Exclude ballots from the backup',
				},
			},
			additionalProperties: false,
		},
	},
	additionalProperties: false,

	examples: [
		{
			scope: {
				type: 'tournament',
			},
			options: {
				ignoreComments: true,
			},
		},
		{
			tournId: 123,
			scope: {
				type: 'event',
				id: 456,
			},
			options: {
				ignoreBallots: true,
			},
		},
	],
};
