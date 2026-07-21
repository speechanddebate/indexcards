import type { ZodOpenApiSchemaObject } from 'zod-openapi';
import z from 'zod';
import * as utils from './utils.ts';

export const Chapter = z.object({
	id: utils.id.meta({ description: 'Unique identifier for the chapter' }),
	name: z.string().meta({ description: 'Name of the chapter' }),
	formal: z.string().nullish(),
	street: z.string().nullish(),
	city: z.string().nullish(),
	state: z.string().max(4).nullish(),
	zip: z.number().nullish(),
	postal: z.string().max(15).nullish(),
	country: z.string().max(4).nullish(),
	coaches: z.string().nullish(),
	self_prefs: z.coerce.boolean().nullish(),
	level: z.string().nullish(),
	nsda: z.number().nullish(),
	district: z.number().nullish(),
	naudl: z.coerce.boolean().nullish(),
	ipeds: z.string().nullish(),
	nces: z.string().nullish(),
	ceeb: z.string().nullish(),
	timestamp: z.string().nullish(),
	created_at: z.string().nullish(),
}).meta({
	id: 'Chapter',
	description: 'A chapter object representing a chapter entity'
}).strict() satisfies ZodOpenApiSchemaObject;

// A user's relation to a chapter, including their permission level
export const UserChapter = z.object({
	...Chapter.shape,
	permission: z.string().meta({ description: 'Permission level for the user in this chapter' }),
})
.strict()
.meta({
	id: 'UserChapter',
	description: "A user's relation to a chapter, including their permission level"
}) satisfies ZodOpenApiSchemaObject;

