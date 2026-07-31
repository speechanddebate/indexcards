import type { ZodOpenApiSchemaObject } from 'zod-openapi';
import z from 'zod';
import * as utils from './utils.js';

export const Event = z.object({
	id: utils.id,
	abbr: z.string(),
	name: z.string(),
	fee: z.number(),
	type: z.enum(['debate', 'speech', 'mock_trial', 'congress', 'wsdc', 'wudc', 'attendee', 'academic']),
	categoryId: utils.id,
	settings: z.object(),
	metadata: z.object(),
	nsdaCategoryId: utils.id.nullable(),
}).meta({ id: 'Event'}) satisfies ZodOpenApiSchemaObject;
