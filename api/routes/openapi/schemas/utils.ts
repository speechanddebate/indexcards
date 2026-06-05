import z from 'zod';
import type { ZodOpenApiSchemaObject } from 'zod-openapi';

export const id = z.coerce.number().int().positive() satisfies ZodOpenApiSchemaObject;
export const TwoLetterCode = z.string().regex(/^[A-Z]{2}$/, 'Must be a valid 2-letter code') satisfies ZodOpenApiSchemaObject;
export const limit = z.coerce.number().int().positive().meta({ description: 'The number of results to return.' })
export const offset = z.coerce.number().int().positive().meta({ description: 'The number of results to skip when returning.' })
