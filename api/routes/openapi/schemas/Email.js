export const Email = {
	type : 'object',
	description: 'An email sent to a tournament',
	required: ['id', 'subject', 'content', 'metadata'],
	properties: {
		id: {
			type: 'integer',
			description: 'The unique identifier',
			readOnly: true,
			example: 123,
		},
		subject: {
			type: 'string',
		},
		content: {
			type: 'string',
		},
		metadata: {
			type: 'string',
		},
		sentTo: {
			type: 'string',
		},
		hidden: {
			type: 'boolean',
		},
		senderRaw: {
			type: 'string',
		},
		sentAt: {
			type: 'string',
			format: 'date-time',
			readOnly: true,
		},
		createdAt: {
			type: 'string',
			format: 'date-time',
			readOnly: true,
		},
		tournId: {
			type: 'integer',
		},
		personId: {
			type: 'integer',
		},
		senderId: {
			type: 'integer',
		},
		Tourn: {
			$ref: '#/components/schemas/Tourn',
		},
		Person: {
			$ref: '#/components/schemas/Person',
		},
		Sender: {
			$ref: '#/components/schemas/Person',
		},
	},
};