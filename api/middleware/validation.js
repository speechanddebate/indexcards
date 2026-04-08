import { BadRequest, UnexpectedError } from '../helpers/problem.js';
import logger from '../helpers/logger.js';

function isHttpMethodKey(key) {
	return ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'].includes(key);
}

function getOpenApiForMethod(openapi, method) {
	if (!openapi || typeof openapi !== 'object') {
		return openapi;
	}

	const normalizedMethod = method?.toLowerCase();
	if (!normalizedMethod || !openapi[normalizedMethod] || typeof openapi[normalizedMethod] !== 'object') {
		return openapi;
	}

	const shared = Object.fromEntries(
		Object.entries(openapi).filter(([key]) => !isHttpMethodKey(key))
	);

	return {
		...shared,
		...openapi[normalizedMethod],
	};
}

export async function ValidateRequest(req, res, next) {
	const openapi = getOpenApiForMethod(req.route?.openapi, req.method);
	const bodySchema = openapi?.requestBody?.content?.['application/json']?.schema;
	const paramsSchema = openapi?.requestParams;
	req.valid = {};
	try {
		if (paramsSchema) {
			const pathSchema = paramsSchema.path;
			const querySchema = paramsSchema.query;
			let result;
			if (pathSchema && typeof pathSchema.safeParse === 'function') {
				result = pathSchema.safeParse(req.params);
				if(!result.success){
					logger.debug('Validation failed for request parameters:', result.error.issues);
					return BadRequest(req,res, 'Invalid request parameters', result.error.issues);
				}
				req.valid.params = result.data;
			}
			if (querySchema && typeof querySchema.safeParse === 'function') {
				result = querySchema.safeParse(req.query);
				if (!result.success) {
					logger.debug('Validation failed for request query:', result.error.issues);
					return BadRequest(req,res, 'Invalid request query', result.error.issues);
				}
				req.valid.query = result.data;
			}
		}
		if (bodySchema && typeof bodySchema.safeParse === 'function') {
			const result = bodySchema.safeParse(req.body);
			if (!result.success) {
				logger.debug('Validation failed for request body:', result.error.issues);
				return BadRequest(req,res, 'Invalid request body',result.error.issues);
			}
			req.valid.body = result.data;
		} else {
			logger.debug('No schema found for request body');
		}
		next();
	} catch (error) {
		logger.error('Unexpected error during request validation:', error);
		return UnexpectedError(req, res, 'Unexpected error during request validation');
	}

}