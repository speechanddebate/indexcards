import z from 'zod';
import * as utils from './utils.js';

export const File = z.object({
	id: utils.id.meta({ description: 'The unique identifier for the file' }),
	tag: z.string().nullable(),
	type: z.string().nullable(),
	label: z.string().nullable(),
	filename: z.string().max(255).nullable(),
	published: z.boolean(),
	pageOrder: z.number().int().nullable(),
	uploaded: z.iso.datetime().nullable(),
	updatedAt: z.iso.datetime(),
});