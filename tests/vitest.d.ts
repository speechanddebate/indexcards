import type { ZodTypeAny } from 'zod';
import type { ZodOpenApiSchemaObject } from 'zod-openapi';

type OpenApiArraySchema = {
	type: 'array';
	items: ZodOpenApiSchemaObject;
};

type SchemaMatcherInput = ZodTypeAny | ZodOpenApiSchemaObject | OpenApiArraySchema;

interface CustomMatchers<R = unknown> {
	toEqualDate(expected: Date | string | number): R;
	toBeProblemResponse(code?: 400 | 401 | 403 | 404 | 429 | 500): R;
	toMatchSchema(schema: SchemaMatcherInput): R;
}

declare module 'vitest' {
	interface Assertion<T = unknown> {
		toEqualDate(expected: Date | string | number): T;
		toBeProblemResponse(code?: 400 | 401 | 403 | 404 | 429 | 500): T;
		toMatchSchema(schema: SchemaMatcherInput): T;
	}

	interface AsymmetricMatchersContaining {
		toEqualDate(expected: Date | string | number): unknown;
		toBeProblemResponse(code?: 400 | 401 | 403 | 404 | 429 | 500): unknown;
		toMatchSchema(schema: SchemaMatcherInput): unknown;
	}
}
