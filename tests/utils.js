
import { expect } from 'vitest';

/**
 * determines if the response is a problem response and has the expected structure
 */
export function expectProblem(res) {
	expect(res.headers['content-type'])
		.toMatch(/application\/problem\+json/);

	expect(res.body).toMatchObject({
		type: expect.any(String),
		title: expect.any(String),
		status: expect.any(Number),
		detail: expect.any(String),
		instance: expect.any(String),
	});
}