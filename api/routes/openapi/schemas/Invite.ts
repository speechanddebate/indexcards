import type { ZodOpenApiSchemaObject } from 'zod-openapi';

export const TournInvite = {
	allOf: [
		{ $ref: '#/components/schemas/Tourn' },
		{
			type: 'object',
			properties: {
				Webpages: {
					type: 'array',
					items: { $ref: '#/components/schemas/Webpage' },
				},
				Files: {
					type: 'array',
					items: { $ref: '#/components/schemas/File' },
				},
				Events: {
					type: 'array',
					items: { $ref: '#/components/schemas/EventInvite' },
				},
				Contacts: {
					type: 'array',
					items: { $ref: '#/components/schemas/TournContact' },
				},
			},
		},
	],
} as const satisfies ZodOpenApiSchemaObject;
export const EventInvite = {

} as const satisfies ZodOpenApiSchemaObject;
