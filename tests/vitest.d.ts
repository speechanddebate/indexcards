import type { ZodTypeAny } from 'zod';

interface CustomMatchers<R = unknown> {
	toEqualDate(expected: Date | string | number): R;
	toBeProblemResponse(code?: 400 | 401 | 404 | 429 | 500): R;
	toMatchSchema(schema: ZodTypeAny): R;
}

declare module 'vitest' {
	interface Assertion<T = unknown> extends CustomMatchers<T> {}
	interface AsymmetricMatchersContaining extends CustomMatchers {}
}
