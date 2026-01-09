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
		security: [{ cookie: [] }],
		tags: Array.from(tagMap.values()),
		'x-tagGroups': buildTagGroups(declaredTagGroups, usedTags),
		paths,
		components: {
			schemas,
			responses,
			parameters,
			securitySchemes: {
				extApiKey:  { type: 'http', scheme: 'basic' },
				cookie: { type: 'apiKey', in: 'cookie', name: 'x-tabroom-cookie' },
			},
		},

	};
}

/**
 * Recursively collect OpenAPI paths and tags from an Express router
 */
export function collectOpenApi(router, basePath = '') {
	const paths = {};
	const usedTags = new Set();

	for (const layer of router.stack) {
		// Case 1: HTTP method route
		if (layer.route) {

			const routePath = joinPaths(basePath, layer.route.path);

			for (const method of Object.keys(layer.route.methods)) {
				const handler = findOpenApiHandler(layer.route.stack);

				const op = normalizeOperation(
					method,
					routePath,
					handler.openapi
				);

				paths[routePath] ??= {};
				paths[routePath][method] = op;

				for (const tag of op.tags) {
					usedTags.add(tag);
				}
			}
		}

		// Case 2: Nested router
		if (layer.name === 'router' && layer.handle?.stack) {
			const mountPath = extractMountPath(layer);
			const child = collectOpenApi(
				layer.handle,
				joinPaths(basePath, mountPath)
			);

			Object.assign(paths, child.paths);
			child.usedTags.forEach(t => usedTags.add(t));
		}
	}

	return { paths, usedTags };
}

/**
 * Prefer a handler that actually defines `.openapi`
 */
function findOpenApiHandler(stack) {
	for (let i = stack.length - 1; i >= 0; i--) {
		if (stack[i].handle?.openapi) {
			return stack[i].handle;
		}
	}
	return stack.at(-1).handle;
}

function normalizeOperation(method, routePath, op = {}) {
	const params = extractPathParams(routePath);
	return {
		...op,
		summary:
			op.summary ??
			`${method.toUpperCase()} ${routePath}`,

		description:
			op.description ??
			`${method.toUpperCase()} ${routePath} is undocumented. Need to add .openapi to handler`,

		tags:
			Array.isArray(op.tags) ? op.tags : [],

		parameters: [
			...(op.parameters ?? []),
			...params,
		],
		responses:
			op.responses ?? {
				200: { description: 'Success' },
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

function extractMountPath(layer) {
	if (!layer.regexp) return '';

	let path = layer.regexp.source
		.replace(/\\\//g, '/')      // unescape slashes
		.replace('(?:/([^/]+?))', ':param') // convert unnamed capture groups
		.replace('/?(?=/|$)', '');           // remove lookahead at end

	// Replace layer.keys with param names if available
	if (layer.keys && layer.keys.length) {
		layer.keys.forEach((key) => {
			path = path.replace(`:param`, `/:${key.name}`);
		});
	}

	const result = path.startsWith('^') ? path.slice(1) : path;
	return result;
}

function joinPaths(base, path) {
	return (`${base}/${path}`)
	.replace(/\/+/g, '/')            // collapse //
	.replace(/\/$/, '')              // trim trailing slash
	.replace(/:([A-Za-z0-9_]+)/g, '{$1}') // :param → {param}
	|| '/';
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