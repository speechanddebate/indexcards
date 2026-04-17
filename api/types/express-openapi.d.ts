import type { ZodTypeAny } from 'zod';
/**
 * extends the default route type to add our openapi definition.
 */
interface RouteOpenApiConfig {
	path: string,
	operationId: string,
	requestParams?: {
		path?: ZodTypeAny;
		query?: ZodTypeAny;
		body?: ZodTypeAny;
	};
	[key: string]: unknown;
}

declare module 'express-serve-static-core' {
	interface IRoute<Route extends string = string> {
		openapi?: RouteOpenApiConfig;
	}
}

export {};
