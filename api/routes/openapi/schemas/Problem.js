export const Problem = {
	type: 'object',
	additionalProperties: true,
	required: ['type', 'title', 'status'],
	properties: {
		type: {
			type: 'string',
			format: 'uri',
			description: 'A URI reference that identifies the problem type.',
		},
		title: {
			type: 'string',
			description: 'A short, human-readable summary of the problem type.',
		},
		status: {
			type: 'integer',
			format: 'int32',
			description: 'The HTTP status code.',
		},
		detail: {
			type: 'string',
			description: 'Human-readable explanation of the error.',
		},
		instance: {
			type: 'string',
			format: 'uri',
			description: 'A URI reference to the specific occurrence.',
		},
	},
};
