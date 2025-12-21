//Modeled after RFC 7807
export const ErrorResponse = {
	description: 'Unexpected Error',
	content: {
		'application/problem+json': {
			schema: {
				$ref: '#/components/schemas/Problem',
			},
			example: {
				type: 'about:blank',
				title: 'Internal Server Error',
				status: 500,
				detail: 'An unexpected error occurred.',
				instance: '/api/v1/example',
			},
		},
	},
};
export const Unauthorized = {
	description: 'Unauthorized - authentication failed or was not provided.',
	content: {
		'application/problem+json': {
			schema: { $ref: '#/components/schemas/Problem' },
		},

	},
};
