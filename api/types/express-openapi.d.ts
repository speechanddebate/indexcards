import type { ZodObject } from 'zod';

type RouteResponses = {
	[key: number]: {
		description: string;
		content?: {
			[key: string]: {
				schema: ZodObject<unknown> | ZodArray<ZodObject<unknown>>;
				example?: unknown;
			}
		}
	} | {
		$ref: string;
	}
};

interface RouteMethodConfig {
	operationId?: string;
	summary: string;
	description: string;
	responses: RouteResponses;
}

/**
 * extends the default route type to add our openapi definition.
 */
interface RouteOpenApiConfig {
	path: string,
	summary?: string,
	description?: string,
	operationId?: string,
	tags?: string[],
	security?: Array<Record<string, unknown>>,
	requestParams?: {
		path?: ZodObject<unknown>;
		query?: ZodObject<unknown>;
		body?: ZodObject<unknown>;
	};
	requestBody?: {
	required: boolean;
	content: {
		[key: string]: {
			schema: ZodObject<unknown> | ZodArray<ZodObject<unknown>>;
			example?: unknown;
		}
	}
};
	responses?: RouteResponses;
	get?: RouteMethodConfig;
	post?: RouteMethodConfig;
	put?: RouteMethodConfig;
	delete?: RouteMethodConfig;
	patch?: RouteMethodConfig;
	//[key: string]: unknown;
}

declare module 'express-serve-static-core' {
	interface IRoute<Route extends string = string> {
		openapi?: RouteOpenApiConfig;
	}
}

export {};
