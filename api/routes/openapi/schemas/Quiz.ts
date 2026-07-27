import type { ZodOpenApiSchemaObject } from 'zod-openapi';
import z from 'zod';
import * as utils from './utils.js';

export const QuizBadge = z.object({
	altText: z.string().nullable().meta({ description: 'The alt text for the badge image' }),
	link: z.url().nullable().meta({ description: 'The link to the badge' }),
	imageUrl: z.url().nullable().meta({ description: 'The URL of the badge image' }),
}).meta({
	id: 'QuizBadge',
	description: 'The badge associated with the certification'
}) satisfies ZodOpenApiSchemaObject;

export const PersonQuiz = z.object({
	id: utils.id,
	person: utils.id,
	quiz: utils.id,
	approvedBy: utils.id.nullable(),
	pending: z.boolean(),
	updatedAt: z.iso.datetime(),
}).meta({
	id: 'PersonQuiz',
}) satisfies ZodOpenApiSchemaObject;

export const Quiz = z.object({
	id: utils.id,
	tag: z.string().max(63).nullable(),
	label: z.string().max(255).nullable(),
	description: z.string().max(511).nullable(),
	sitewide: z.boolean().default(false),
	hidden: z.boolean().default(false),
	approval: z.boolean().default(false),
	show_answers: z.boolean().default(false),
	admin_only: z.boolean().default(false),
	circuit: utils.id.nullable(),
	Badge: QuizBadge,
	PersonQuizzes: z.array(PersonQuiz).optional(),
}).meta({
	id: 'Quiz',
}) satisfies ZodOpenApiSchemaObject;

export const PersonQuizWithQuiz = PersonQuiz.extend({
	Quiz: Quiz,
}) satisfies ZodOpenApiSchemaObject;