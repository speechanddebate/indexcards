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
			case 403:
				matchesExpectedCode =
					body.title === 'You Do Not Have Access to This Resource' &&
					body.status === 403 &&
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
/**
 * validate an object against a provided zod schema and if fails, report the issues
 */
expect.extend({
	toMatchSchema(received, schema) {
		const hasSafeParse = schema && typeof schema.safeParse === 'function';

		if (hasSafeParse) {
			const parsed = schema.safeParse(received);
			const pass = parsed.success;
			return {
				pass,
				message: () => {
					if (pass) {
						return 'expected object not to match schema';
					}
					return `expected object to match schema, but validation failed:\n${JSON.stringify(parsed.error.format(), null, 2)}`;
				},
			};
		}

		const errors = [];
		const pass = validateOpenApiSchema(received, schema, errors, '$');
		return {
			pass,
			message: () =>
				pass
					? 'expected object not to match schema'
					: `expected object to match schema, but validation failed:\n${errors.join('\n')}`,
		};
	},
});

function validateOpenApiSchema(value, schema, errors, path) {
	if (!schema || typeof schema !== 'object') {
		errors.push(`${path}: invalid schema object`);
		return false;
	}

	if (schema.$ref) {
		// Cannot dereference components in this matcher context; treat refs as pass-through.
		return true;
	}

	const declaredType = schema.type;
	const allowedTypes = Array.isArray(declaredType)
		? declaredType
		: (typeof declaredType === 'string' ? [declaredType] : []);

	if (schema.enum && Array.isArray(schema.enum) && !schema.enum.includes(value)) {
		errors.push(`${path}: value ${JSON.stringify(value)} is not in enum ${JSON.stringify(schema.enum)}`);
		return false;
	}

	if (value === null) {
		if (allowedTypes.includes('null') || declaredType === undefined) {
			return true;
		}
		errors.push(`${path}: expected ${JSON.stringify(allowedTypes)} but received null`);
		return false;
	}

	if (allowedTypes.includes('array')) {
		if (!Array.isArray(value)) {
			errors.push(`${path}: expected array`);
			return false;
		}
		if (schema.items) {
			let ok = true;
			for (let i = 0; i < value.length; i++) {
				if (!validateOpenApiSchema(value[i], schema.items, errors, `${path}[${i}]`)) {
					ok = false;
				}
			}
			return ok;
		}
		return true;
	}

	if (allowedTypes.includes('object') || schema.properties || schema.required) {
		if (typeof value !== 'object' || Array.isArray(value)) {
			errors.push(`${path}: expected object`);
			return false;
		}

		let ok = true;
		const required = Array.isArray(schema.required) ? schema.required : [];
		for (const key of required) {
			if (!(key in value)) {
				errors.push(`${path}.${key}: is required`);
				ok = false;
			}
		}

		const properties = schema.properties && typeof schema.properties === 'object'
			? schema.properties
			: {};
		for (const [key, propSchema] of Object.entries(properties)) {
			if (key in value && !validateOpenApiSchema(value[key], propSchema, errors, `${path}.${key}`)) {
				ok = false;
			}
		}

		return ok;
	}

	if (allowedTypes.includes('string')) {
		if (typeof value !== 'string') {
			errors.push(`${path}: expected string`);
			return false;
		}
		return true;
	}

	if (allowedTypes.includes('integer')) {
		if (typeof value !== 'number' || !Number.isInteger(value)) {
			errors.push(`${path}: expected integer`);
			return false;
		}
		return true;
	}

	if (allowedTypes.includes('number')) {
		if (typeof value !== 'number') {
			errors.push(`${path}: expected number`);
			return false;
		}
		return true;
	}

	if (allowedTypes.includes('boolean')) {
		if (typeof value !== 'boolean') {
			errors.push(`${path}: expected boolean`);
			return false;
		}
		return true;
	}

	// If no type is declared, do not block validation.
	return true;
}