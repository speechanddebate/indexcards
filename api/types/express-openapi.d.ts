import type { ZodObject } from 'zod';
/**
 * extends the default route type to add our openapi definition.
 */
interface RouteOpenApiConfig {
	path: string,
	operationId?: string,
	requestParams?: {
		path?: ZodObject<unknown>;
		query?: ZodObject<unknown>;
		body?: ZodObject<unknown>;
	};
	[key: string]: unknown;
}

declare module 'express-serve-static-core' {
	interface IRoute<Route extends string = string> {
		openapi?: RouteOpenApiConfig;
	}
}

export {};
