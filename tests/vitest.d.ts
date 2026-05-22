import type { ZodTypeAny } from 'zod';
import type { ZodOpenApiSchemaObject } from 'zod-openapi';

type OpenApiArraySchema = {
	type: 'array';
	items: ZodOpenApiSchemaObject;
};

type SchemaMatcherInput = ZodTypeAny | ZodOpenApiSchemaObject | OpenApiArraySchema;

interface CustomMatchers<R = unknown> {
	toEqualDate(expected: Date | string | number): R;
	toBeProblemResponse(code?: 400 | 401 | 404 | 429 | 500): R;
	toMatchSchema(schema: SchemaMatcherInput): R;
}

declare module 'vitest' {
	interface Assertion<T = unknown> extends CustomMatchers<T> {}
	interface AsymmetricMatchersContaining extends CustomMatchers {}
}
