import type { ZodOpenApiSchemaObject } from 'zod-openapi';

export const NSDACategory = {
	type: 'object',
	required: ['id', 'name', 'type', 'code'],
	properties: {
		id        : { type : 'integer' } ,
		name      : { type : 'string' }  ,
		type      : { type : 'string' }  ,
		code      : { type : 'integer' } ,
		nationals : { type : 'boolean' } ,
	},
	examples: [
		{
			id   : 202,
			name : 'Extemporaneous',
			type : 's',
			code : 202,
		},
	],
} as const satisfies ZodOpenApiSchemaObject;