import z from 'zod';
import * as utils from './utils.ts';
import type { ZodOpenApiSchemaObject } from 'zod-openapi';
import { Chapter } from './Chapter.ts';
import { Person } from './Person.ts';

export const Student = z.object({
	id: utils.id.readonly().meta({ description: 'Unique identifier for the student' }),
	first: z.string().nullish().meta({ description: 'First name of the student' }),
	middle: z.string().nullish().meta({ description: 'Middle name of the student' }),
	last: z.string().nullish().meta({ description: 'Last name of the student' }),
	phonetic: z.string().nullish().meta({ description: 'Pronunciation guide' }),
	gradYear: z.number().nullish().meta({ description: 'Full Year of student graduation' }),
	novice: z.boolean().optional().meta({ description: 'Whether the student is a novice' }),
	retired: z.boolean().optional().meta({ description: 'Whether the student is retired' }),
	gender: z.string().nullish().meta({ description: 'Student gender' }),
	nsda: z.number().nullish().meta({ description: 'NSDA Member ID Number' }),
	chapterId: utils.id.meta({ description: 'Chapter School that the student belongs to' }),
	personId: utils.id.nullish().meta({ description: 'Tabroom Person the student is linked to' }),
	Chapter: Chapter.optional(),
	Person: Person.optional(),
	createdAt: z.string().readonly().meta({ description: 'Creation timestamp' }),
	settings: z.object().optional().meta({ description: 'Custom settings for the student' }),
	metadata: z.object().optional().meta({ description: 'Additional metadata for the student' }),
}) satisfies ZodOpenApiSchemaObject;

export const UnlinkedStudentSearch = z.object({
	id: utils.id,
	first: z.string().nullable(),
	middle: z.string().nullish(),
	last: z.string().nullable(),
	gradYear: z.number().nullish(),
	Chapter: z.object({
		name: z.string().nullable(),
		state: z.string().nullable(),
	}).nullable(),
	tournCount: z.number().nullable(),
}) satisfies ZodOpenApiSchemaObject;
