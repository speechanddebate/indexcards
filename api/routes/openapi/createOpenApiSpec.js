import schemas from './schemas/index.js';
import responses from './responses/index.js';
import { tags as declaredTags, declaredTagGroups } from './tags.js';
import {parameters } from './parameters.js';

import { readFile } from 'node:fs/promises';

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
export function createOpenApiSpec(apiRouter) {
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

	return {
		openapi: '3.1.0',
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
}

/**
 * Recursively collect OpenAPI paths and tags from an Express router
 */
export function collectOpenApi(router) {
	const paths = {};
	const usedTags = new Set();

	for (const layer of router.stack) {
		if (layer.route) {

			for (const method of Object.keys(layer.route.methods)) {
				// Get .openapi metadata from the route
				const openapi = layer.route.openapi;

				// Routes must have explicit .openapi.path set at definition time
				if (!openapi?.path) {
					console.warn(`Warning: Route ${layer.route.path} missing .openapi.path, skipping`);
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
		if (layer.name === 'router' && layer.handle?.stack) {
			const child = collectOpenApi(layer.handle);

			Object.assign(paths, child.paths);
			child.usedTags.forEach(t => usedTags.add(t));
		}
	}

	return { paths, usedTags };
}

function normalizeOperation(method, routePath, openapi) {
	const params = extractPathParams(routePath);

	// Exclude path property (used for routing, not OpenAPI)
	const opWithoutPath = Object.fromEntries(
		Object.entries(openapi).filter(([key]) => key !== 'path')
	);

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

		parameters: [
			...(openapi.parameters ?? []),
			...params,
		],
		//add a 401 and 500 error to every endpoint and a 200 if nothing was defined
		responses: {
			...(openapi.responses ?? { 200: { description: 'Success' } }),
			...Object.fromEntries(
				Object.entries({
					500 : { $ref: '#/components/responses/ErrorResponse' },
					401 : { $ref : '#/components/responses/Unauthorized'},
				})
					.filter(([code]) => !(openapi.responses && code in openapi.responses))
			),
		},
	};
}

function extractPathParams(path) {
	return [...path.matchAll(/\{([^}]+)\}/g)].map(m => {
		const name = m[1];

		// If a named parameter exists in components, reference it
		if (parameters?.[name]) {
			return { $ref: `#/components/parameters/${name}` };
		}

		// Otherwise generate a default path param
		return {
			name,
			in: 'path',
			required: true,
			schema: { type: 'string' },
		};
	});
}

function buildTagGroups(tagGroups, usedTags) {
	const grouped = new Set(
		tagGroups.flatMap(g => g.tags)
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