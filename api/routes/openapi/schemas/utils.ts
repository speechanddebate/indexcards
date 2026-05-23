import z from 'zod';
import type { ZodOpenApiSchemaObject } from 'zod-openapi';

export const id = z.coerce.number().int().positive() satisfies ZodOpenApiSchemaObject;
export const TwoLetterCode = z.string().regex(/^[A-Z]{2}$/, 'Must be a valid 2-letter code') satisfies ZodOpenApiSchemaObject;