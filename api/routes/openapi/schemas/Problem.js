export const Problem = {
	type: 'object',
	additionalProperties: true,
	required: ['type', 'title', 'status'],
	properties: {
		type: {
			type: 'string',
			format: 'uri',
			description: 'A URI reference that identifies the problem type.',
			example: 'https://api.example.com/errors/unauthorized',
		},
		title: {
			type: 'string',
			description: 'A short, human-readable summary of the problem type.',
			example: 'Unauthorized',
		},
		status: {
			type: 'integer',
			format: 'int32',
			description: 'The HTTP status code.',
			example: 401,
		},
		detail: {
			type: 'string',
			description: 'Human-readable explanation of the error.',
			example: 'The provided API key is invalid.',
		},
		instance: {
			type: 'string',
			format: 'uri',
			description: 'A URI reference to the specific occurrence.',
			example: '/v1/users/123',
		},
	},
};
