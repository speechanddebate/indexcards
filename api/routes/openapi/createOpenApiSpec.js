import schemas from './schemas/index.js';
import responses from './responses/index.js';

export function createOpenApiSpec(apiRouter) {

	const spec = {
		openapi: '3.0.2',
		servers: [{
			url: '/v1',
		}],
		info: {
			title: 'IndexCards API',
			version: '1.0.0',
			description: 'Tabroom.com data & operational API',
			license: {
				name : 'Copyright 2014-2021, National Speech & Debate Assocation',
			},
		},
		paths: collectOpenApi(apiRouter),
		components: {
			schemas,
			responses,
			securitySchemes: { basic: { type: 'http', scheme: 'basic' } },
		},
		security: [{ basic: [] }],
	};
	return spec;
}
// collectOpenApi.js
export function collectOpenApi(router, basePath = '') {
	const paths = {};

	for (const layer of router.stack) {
		// Case 1: HTTP method route
		if (layer.route) {
			const routePath = joinPaths(basePath, layer.route.path);

			for (const method of Object.keys(layer.route.methods)) {
				const handler = layer.route.stack.at(-1).handle;

				paths[routePath] ??= {};
				paths[routePath][method] =
					handler.openapi ??
					defaultOperation(method, routePath);
			}
		}

		// Case 2: Nested router
		if (layer.name === 'router' && layer.handle?.stack) {
			const mountPath = extractMountPath(layer);
			Object.assign(
				paths,
				collectOpenApi(layer.handle, joinPaths(basePath, mountPath))
			);
		}
	}

	return paths;
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

function defaultOperation(method, routePath) {
	return {
		summary: 'Undocumented Endpoint',
		description: `${method.toUpperCase()} ${routePath} us undocumented. Need to add .openapi to handler`,
		responses: {
			200: {
				description: 'Success',
			},
		},
	};
}
