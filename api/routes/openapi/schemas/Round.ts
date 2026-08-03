import z from 'zod';
import * as utils from './utils.js';
import { ZodOpenApiSchemaObject } from 'zod-openapi';

export const Round = z.object({
	id: utils.id,
	type: z.string().max(15).nullable(),
	name: z.int().nullable(),
	label: z.string().max(31).nullable(),
	flighted: z.boolean().nullable(),
}).strict().meta({
	id: 'Round',
}) satisfies ZodOpenApiSchemaObject;