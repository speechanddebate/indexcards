export const PublicAd = {
	type : 'object',
	description: 'A public representation of the ads displayed on the homepage',
	additionalProperties: false,
	properties : {
		id: {
			type : 'number',
			readOnly: true,
			description: 'the Id of the Ad',
			example: 1,
		},
		filename: {
			type : 'string',
			description: 'The Image filename',
			example: 'https://someurl.s2.aws.com',
		},
		url: {
			type : 'string',
			description: 'The link to follow when the ad is clicked',
			example: 'https://www.example.com',
		},
	},
};
export const Ad = {
	allOf: [
		{ $ref: '#/components/schemas/PublicAd' },
		{
			type : 'object',
			description: 'An admin representation of the ads displayed on the homepage',
			additionalProperties: false,
			properties: {
				tag: {
					type: 'string',
					description: 'An identifiable name for the ad',
					example: 'National Tournament promotion',
				},
				sortOrder: {
					type: 'integer',
					format: 'int16',
					description: 'Sort order for display (SMALLINT)',
					example: 3,
				},

				start: {
					type: 'string',
					format: 'date-time',
					description: 'Start timestamp',
					example: '2025-01-15T10:00:00Z',
				},

				end: {
					type: 'string',
					format: 'date-time',
					description: 'End timestamp',
					example: '2025-01-15T12:00:00Z',
				},

				approved: {
					type: 'boolean',
					description: 'Whether the item has been approved',
					example: false,
				},

				background: {
					type: 'string',
					maxLength: 15,
					description: 'Background identifier or color',
					example: 'blue-gradient',
				},

				person: {
					type: 'integer',
					format: 'int32',
					description: 'ID of the person who owns the item',
					example: 42,
				},

				approvedBy: {
					type: 'integer',
					format: 'int32',
					description: 'ID of the person who approved the item',
					example: 7,
				},

				createdAt: {
					type: 'string',
					format: 'date-time',
					readOnly: true,
					description: 'Record creation timestamp',
					example: '2025-01-12T18:20:00Z',
				},

				timestamp: {
					type: 'string',
					format: 'date-time',
					readOnly: true,
					description: 'Last updated timestamp',
					example: '2025-01-12T18:20:00Z',
				},

			},
		},
	],
};

