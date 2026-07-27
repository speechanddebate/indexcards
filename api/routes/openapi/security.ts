import type { ZodOpenApiSecuritySchemeObject, ZodOpenApiObject } from 'zod-openapi';

import config from '../../config.js';
const schemes: Record<string, ZodOpenApiSecuritySchemeObject> = {
	extApiKey:  { type: 'http', scheme: 'basic' },
	bearerAuth: { type: 'http', scheme: 'bearer' },
	cookieAuth: {
		type: 'apiKey',
		in: 'cookie',
		name: config.cookie.name, 
		description: `send the session token as a cookie. For direct API access, we recommend using bearerAuth.`,
	},
};

// The default API security requirements. Default to no required authentication.
const defaultSecurity: ZodOpenApiObject['security'] = [];

/**
 * sets the security to require either bearer token or cookie auth. Can be used in individual route definitions to override the default.
 */
export const requireAuth: ZodOpenApiObject['security'] = [{ bearerAuth: [] }, { cookieAuth: [] }];
/** 
 * sets the security to optional auth. should be used for route where you don't need to be logged in, but if you are, something is different.
 */
export const optionalAuth: ZodOpenApiObject['security'] = [{}, ...requireAuth ];
/**
 * sets the security to require an Ext API key
 */
export const requireExtApiKey: ZodOpenApiObject['security'] = [{ extApiKey: [] }];

export default {
	schemes,
	defaultSecurity,
}
