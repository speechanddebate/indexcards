import type { ZodOpenApiSchemaObject } from 'zod-openapi';
import z from 'zod';
import * as utils from './utils.js';

export const Chapter = z.object({
	id: utils.id.meta({ description: 'Unique identifier for the chapter' }),
	name: z.string().meta({ description: 'Name of the chapter' }),
	formal: z.string().nullish(),
	street: z.string().nullish(),
	city: z.string().nullish(),
	state: z.string().nullish(),
	zip: z.number().nullish(),
	postal: z.string().nullish(),
	country: z.string().nullish(),
	coaches: z.string().nullish(),
	selfPrefs: z.boolean().nullish(),
	level: z.string().nullish(),
	nsdaId: z.number().nullish(),
	districtId: z.number().nullish(),
	naudl: z.boolean().nullish(),
	ipeds: z.string().nullish(),
	nces: z.string().nullish(),
	ceeb: z.string().nullish(),
	timestamp: z.string().nullish(),
	createdAt: z.string().nullish(),
}) satisfies ZodOpenApiSchemaObject;

