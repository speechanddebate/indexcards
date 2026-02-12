import { expect } from 'vitest';

/**
 * determines if the response is a problem response and has the expected structure
 */
expect.extend({
	toBeProblemResponse(res, code) {
		const headersContent = res?.headers?.['content-type'];
		const hasContentType = typeof headersContent === 'string' && /application\/problem\+json/.test(headersContent);

		const body = res?.body;
		const hasBodyShape =
            body &&
            typeof body === 'object' &&
            typeof body.type === 'string' &&
            typeof body.title === 'string' &&
            typeof body.status === 'number' &&
            typeof body.detail === 'string' &&
            typeof body.instance === 'string' &&
			body.instance.length > 0;

		let matchesExpectedCode = true;
		switch (code) {
			case 400:
				matchesExpectedCode =
					body.title === 'Request Validation Failed' &&
					body.status === 400 &&
					body.detail.length > 0;
				break;
			case 401:
				matchesExpectedCode =
					body.title === 'Invalid or Missing Credentials' &&
					body.status === 401 &&
					body.detail.length > 0;
				break;
			case 404:
				matchesExpectedCode =
					body.title === 'The specified resource was not found.' &&
					body.status === 404 &&
					body.detail.length > 0;
				break;
			case 429:
				matchesExpectedCode =
					body.title === 'Rate limit exceeded' &&
					body.status === 429 &&
					body.detail.length > 0;
				break;
			case undefined:
				break;
			default:
				throw new Error(`toBeProblemResponse does not support status code ${code}`);
		}
		const pass = hasContentType && hasBodyShape && matchesExpectedCode;

		return {
			pass,
			message: () =>
                pass
                    ? 'expected response not to be a problem response'
                    : `expected response to be a problem response ${code ? 'with status code ' + code : ''}\ncontent-type: ${String(headersContent)}\nbody: ${JSON.stringify(body)}`,
		};
	},
});