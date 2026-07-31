import z from 'zod';
import type { ZodOpenApiSchemaObject } from 'zod-openapi';
import { Judge, Category, Event } from './index.js';
import * as utils from './utils.js';
export const CurrentBallot = z.object({
	id: utils.id,
	flight: z.int().positive().nullable(),
	startText: z.string().nullable(),
	Judge: Judge.pick({
		id: true,
		code: true,
		first: true,
		last: true,
	}),
	Category: Category.pick({
		id: true,
		name: true,
		abbr: true,
	}),
	Event: Event.pick({
		id: true,
		name: true,
		abbr: true,
		type: true,
	}),
}).meta({
	id: 'CurrentBallot',
}) satisfies ZodOpenApiSchemaObject;
export type CurrentBallotType = z.infer<typeof CurrentBallot>;
