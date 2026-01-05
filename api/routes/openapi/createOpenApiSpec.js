import schemas from './schemas/index.js';
import responses from './responses/index.js';
import { tags as declaredTags, declaredTagGroups } from './tags.js';

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
			version: '1.0.0',
			description: 'Tabroom.com data & operational API',
			license: {
				name: 'Copyright 2014-2021, National Speech & Debate Assocation',
			},
		},
		tags: Array.from(tagMap.values()),
		'x-tagGroups': buildTagGroups(declaredTagGroups, usedTags),
		paths,
		components: {
			schemas,
			responses,
			securitySchemes: {
				basic: { type: 'http', scheme: 'basic' },
			},
		},
		security: [{ basic: [] }],
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
	return {
		summary:
			op.summary ??
			`${method.toUpperCase()} ${routePath}`,

		description:
			op.description ??
			`${method.toUpperCase()} ${routePath} is undocumented. Need to add .openapi to handler`,

		tags:
			Array.isArray(op.tags) ? op.tags : [],

		responses:
			op.responses ?? {
				200: { description: 'Success' },
			},
	};
}

function extractMountPath(layer) {
	if (!layer.regexp) return '';

	const match = layer.regexp.source
		.replace(/\\\//g, '/')
		.match(/^\^\/([^/?]+)(?:\/\?\(\?\/\|\$\))?/);

	return match ? `/${match[1]}` : '';
}

function joinPaths(base, path) {
	return (`${base}/${path}`)
		.replace(/\/+/g, '/')
		.replace(/\/$/, '') || '/';
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