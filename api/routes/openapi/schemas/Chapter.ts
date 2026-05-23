import type { ZodOpenApiSchemaObject } from 'zod-openapi';
export const Chapter = {
	type: 'object',
	properties: {
		id: { type: 'integer' },
		name: { type: 'string' },
		formal: { type: ['string', 'null'] },
		street: { type: ['string', 'null'] },
		city: { type: ['string', 'null'] },
		state: { type: ['string', 'null'] },
		zip: { type: ['integer', 'null'] },
		postal: { type: ['string', 'null'] },
		country: { type: ['string', 'null'] },
		coaches: { type: ['string', 'null'] },
		selfPrefs: { type: 'boolean' },
		level: { type: ['string', 'null'] },
		nsdaId: { type: ['integer', 'null'] },
		districtId: { type: ['integer', 'null'] },
		naudl: { type: 'boolean' },
		ipeds: { type: ['string', 'null'] },
		nces: { type: ['string', 'null'] },
		ceeb: { type: ['string', 'null'] },
		timestamp: { type: ['string', 'null'], format: 'date-time' },
		createdAt: { type: ['string', 'null'], format: 'date-time' },
	},
} as const satisfies ZodOpenApiSchemaObject;

