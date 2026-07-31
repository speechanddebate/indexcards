import type { ZodOpenApiOperationObject, ZodOpenApiPathItemObject } from 'zod-openapi';

export type RouteOpenApiConfig = (ZodOpenApiPathItemObject | ZodOpenApiOperationObject) & {
	path: string;
};

declare module 'express-serve-static-core' {
	interface IRoute<Route extends string = string> {
		openapi?: RouteOpenApiConfig;
	}
	interface Request {
		actor: any; // Replace `any` with the actual type of `actor` if available
	}
}

