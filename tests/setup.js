import { expect } from 'vitest';

function toMariaDbSecondPrecision(dateValue) {
	const timestamp = new Date(dateValue).getTime();
	if (Number.isNaN(timestamp)) {
		return null;
	}

	return Math.floor(timestamp / 1000);
}
/**
 * maria db chops off milliseconds from datetime values so this helps compare dates at second precision
 */
expect.extend({
	toEqualDate(received, expected) {
		const receivedSeconds = toMariaDbSecondPrecision(received);
		const expectedSeconds = toMariaDbSecondPrecision(expected);
		const hasInvalidDate = receivedSeconds === null || expectedSeconds === null;
		const pass = !hasInvalidDate && receivedSeconds === expectedSeconds;

		return {
			pass,
			message: () => {
				if (hasInvalidDate) {
					return `expected valid dates but received ${String(received)} and ${String(expected)}`;
				}

				return pass
					? `expected ${String(received)} not to equal ${String(expected)} at MariaDB second precision`
					: `expected ${String(received)} to equal ${String(expected)} at MariaDB second precision`;
			},
		};
	},
});
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
            typeof body.instance === 'string';

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