//Modeled after RFC 7807
export const ErrorResponse = {
	description: 'Unexpected Error',
	content: {
		'application/problem+json': {
			schema: {
				$ref: '#/components/schemas/Problem',
			},
			examples:{
				error: {
					summary: '500 Internal Server Error',
					value: {
						type: 'about:blank',
						title: 'Internal Server Error',
						status: 500,
						detail: 'An unexpected error occurred.',
						instance: '/api/v1/example',
					},
				},
			},
		},
	},
};
export const Unauthorized = {
	description: 'Unauthorized - authentication failed or was not provided.',
	content: {
		'application/problem+json': {
			schema: { $ref: '#/components/schemas/Problem' },
			examples: {
				unauthorized: {
					summary: '401 Unauthorized',
					value: {
						type: 'about:blank',
						title: 'Unauthorized',
						status: 401,
						detail: 'You are not authorized to access this resource.',
					},
				},
			},
		},

	},
};
export const NotFound = {
	description: 'NotFound - the requested resource was not found or you do not have access.',
	content: {
		'application/problem+json': {
			schema: { $ref: '#/components/schemas/Problem' },
			examples:{
				notfound: {
					summary: '404 Not Found',
					value: {
						type: 'about:blank',
						title: 'Not Found',
						status: 404,
						detail: 'The requested resource foo with ID bar was not found.',
						instance: '/api/v1/example',
					},
				},
			},
		},
	},
};

