
	import z from 'zod';
	import type { ZodOpenApiSchemaObject } from 'zod-openapi';
	import * as utils from './utils.js';
	export const Room = z.object({
		id: utils.id,
		name: z.string().max(127),
		url: z.string().max(255).nullable(),
		notes: z.string().max(63).nullable(),

	}).strict().meta({
		id: 'Room',
	}) satisfies ZodOpenApiSchemaObject;
