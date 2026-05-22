import type { ZodOpenApiSchemaObject } from 'zod-openapi';

export const SiteResponse = {
	type: 'object',
	properties: {
		id: { type: 'integer' , readOnly: true },
		name: { type: 'string' },
		online: { type: 'boolean' },
		directions: { type: ['string', 'null'] },
		dropoff: { type: ['string', 'null'] },
		hostId: { type: ['integer', 'null'] },
		circuitId: { type: ['integer', 'null'] },
		createdAt: { type: 'string', format: 'date-time', readOnly: true },
		updatedAt: { type: 'string', format: 'date-time', readOnly: true },
	},
} as const satisfies ZodOpenApiSchemaObject;