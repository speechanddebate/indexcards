import * as schemas from './schemas/index.ts';
import { createDocument } from 'zod-openapi';
import * as responses from './responses/index.ts';
import { tags as declaredTags, declaredTagGroups } from './tags.ts';
import { parameters } from './parameters.ts';

import { readFile } from 'node:fs/promises';

import type { ZodOpenApiObject, ZodOpenApiOperationObject } from 'zod-openapi';
import type { RouteOpenApiConfig } from '../../types/express-openapi.d.ts';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];
type RouteOperationConfig = ZodOpenApiOperationObject & { path: string };

type RouterLike = {
	stack?: unknown[];
};

const pkg = JSON.parse(
	await readFile(
		new URL('../../../package.json', import.meta.url),
		'utf8'
	)
);
/**
 * Build the OpenAPI spec from an Express router.
 * - Collects all paths + operations
 * - Collects all tags actually used by operations
 * - Automatically adds missing tags to `spec.tags`
 */
export function createOpenApiSpec(apiRouter: RouterLike) {
	// Collect paths + used tags
	const { paths, usedTags } = collectOpenApi(apiRouter);

	// Start with explicitly declared tags
	const tagMap = new Map(
		declaredTags.map(tag => [tag.name, tag])
	);

	// Add any missing tags that were used by operations
	for (const tagName of usedTags) {
		if (!tagMap.has(tagName)) {
			tagMap.set(tagName, {
				name: tagName,
				description: 'Auto-discovered tag',
			});
		}
	}

	const doc: ZodOpenApiObject = {
		openapi: '3.1.1',
		servers: [{ url: '/v1' }],
		info: {
			title: 'IndexCards API',
			version: pkg.version,
			description: 'Tabroom.com data & operational API',
			termsOfService: 'https://www.speechanddebate.org/terms-conditions/',
			license: {
				name: 'Copyright 2014-2021, National Speech & Debate Association',
				identifier: pkg.license,
			},
		},
		security: [{ bearer: [] },{ cookie: []}],
		tags: Array.from(tagMap.values()),
		'x-tagGroups': buildTagGroups(declaredTagGroups, usedTags),
		paths,
		components: {
			schemas,
			responses,
			parameters,
			securitySchemes: {
				extApiKey:  { type: 'http', scheme: 'basic' },
				bearer: { type: 'http', scheme: 'bearer' },
				cookie: { type: 'apiKey', in: 'cookie', name: 'x-tabroom-cookie' },
			},
		},
	};
	return createDocument(doc,{
		reused: 'inline',
	});
}

/**
 * Recursively collect OpenAPI paths and tags from an Express router
 */
export function collectOpenApi(router: RouterLike) {
	const paths: Record<string, Record<string, unknown>> = {};
	const usedTags = new Set<string>();

	for (const layer of (router.stack ?? []) as Array<Record<string, unknown>>) {
		const route = layer.route as undefined | {
			path?: string;
			methods?: Record<string, unknown>;
			openapi?: RouteOpenApiConfig;
		};

		if (route) {

			for (const method of Object.keys(route.methods ?? {})) {
				if (!isHttpMethodKey(method)) {
					continue;
				}

				const openapi = getOpenApiForMethod(route.openapi, method);

				// Routes must have explicit .openapi.path set at definition time
				if (!openapi?.path) {
					console.warn(`Warning: Route ${route.path} missing .openapi.path, skipping`);
					continue;
				}

				const op = normalizeOperation(
					method,
					openapi.path,
					openapi
				);

				paths[openapi.path] ??= {};
				paths[openapi.path][method] = op;

				for (const tag of op.tags) {
					usedTags.add(tag);
				}
			}
		}

		// Case 2: Nested router
		const handle = layer.handle as undefined | RouterLike;
		if (layer.name === 'router' && handle?.stack) {
			const child = collectOpenApi(handle);

			Object.assign(paths, child.paths);
			child.usedTags.forEach((t: string) => usedTags.add(t));
		}
	}

	return { paths, usedTags };
}

function isRouteOperationConfig(openapi: RouteOpenApiConfig): openapi is RouteOperationConfig {
	return !Object.keys(openapi).some(isHttpMethodKey);
}

function getOpenApiForMethod(openapi: RouteOpenApiConfig | undefined, method: HttpMethod): RouteOperationConfig | undefined {
	if (!openapi || typeof openapi !== 'object') {
		return undefined;
	}

	const openapiRecord = openapi as Record<string, unknown> & { path: string };
	const methodConfig = openapiRecord[method];

	if (!methodConfig || typeof methodConfig !== 'object') {
		return isRouteOperationConfig(openapi) ? openapi : undefined;
	}

	const shared = Object.fromEntries(
		Object.entries(openapiRecord).filter(([key]) => !isHttpMethodKey(key))
	);

	return {
		...shared,
		...(methodConfig as Record<string, unknown>),
		path: (methodConfig as { path?: string }).path ?? (shared.path as string | undefined) ?? openapiRecord.path,
	} as RouteOperationConfig;
}

function isHttpMethodKey(key: string): key is HttpMethod {
	return HTTP_METHODS.includes(key as HttpMethod);
}

function normalizeOperation(method: HttpMethod, routePath: string, openapi: RouteOperationConfig) {
	const params = extractPathParams(routePath);

	// Exclude path property (used for routing, not OpenAPI)
	const opWithoutPath = Object.fromEntries(
		Object.entries(openapi).filter(([key]) => key !== 'path')
	);

	const existingResponses = openapi.responses && typeof openapi.responses === 'object'
		? Object.fromEntries(Object.entries(openapi.responses).map(([code, response]) => [String(code), response]))
		: { 200: { description: 'Success' } };

	return {
		...opWithoutPath,
		summary:
			openapi.summary ??
			`${method.toUpperCase()} ${routePath}`,

		description:
			openapi.description ??
			`${method.toUpperCase()} ${routePath} is undocumented. Need to add .openapi to handler`,

		tags:
			Array.isArray(openapi.tags) ? openapi.tags : [],

		parameters: [...(Array.isArray(openapi.parameters) ? openapi.parameters : []), ...params],
		//add a 401 and 500 error to every endpoint and a 200 if nothing was defined
		responses: {
			...existingResponses,
			...Object.fromEntries(
				Object.entries({
					500 : { $ref: '#/components/responses/ErrorResponse' },
					401 : { $ref : '#/components/responses/Unauthorized'},
				})
					.filter(([code]) => !(code in existingResponses))
			),
		},
	};
}

function extractPathParams(path: string) {
	const knownParameters = parameters as Record<string, unknown>;

	return [...path.matchAll(/\{([^}]+)\}/g)].map(m => {
		const name = m[1];

		// If a named parameter exists in components, reference it
		if (knownParameters[name]) {
			return { $ref: `#/components/parameters/${name}` };
		}

		// Otherwise generate a default path param
		return {
			name,
			in: 'path',
			required: true,
			schema: { type: name.endsWith('Id') ? 'integer' : 'string' },
		};
	});
}

function buildTagGroups(tagGroups: Array<{ name: string; tags: string[] }>, usedTags: Set<string>) {
	const grouped = new Set(
		tagGroups.flatMap((g: { tags: string[] }) => g.tags)
	);

	const otherTags = [...usedTags].filter(
		tag => !grouped.has(tag)
	);

	const finalGroups = [...tagGroups];

	if (otherTags.length) {
		finalGroups.push({
			name: 'Other',
			tags: otherTags.sort(),
		});
	}

	return finalGroups;
}