import type { ZodOpenApiParameterObject } from 'zod-openapi';

export const parameters: Record<string, ZodOpenApiParameterObject> = {
	tournId: {
		name: 'tournId',
		in: 'path',
		description: 'The ID or webname of the tournament to retrieve.',
		required: true,
		schema: {
			type: 'string',
		},
	},
	roundId: {
		name: 'roundId',
		in: 'path',
		description: 'The ID or webname of the round to retrieve.',
		required: true,
		schema: {
			type: 'string',
		},
	},
};