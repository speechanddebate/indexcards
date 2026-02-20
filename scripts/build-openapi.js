#!/usr/bin/env node
import { createOpenApiSpec } from '../api/routes/openapi/createOpenApiSpec.js';
import apiRouter from '../api/routes/routers/v1/indexRouter.js';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const outputPath = new URL('../api/routes/openapi/openapi.json', import.meta.url);

try {
	const spec = createOpenApiSpec(apiRouter);

	// Strict validation
	const routeCount = Object.keys(spec.paths).length;
	if (routeCount === 0) {
		console.error('No routes in OpenAPI spec!');
		process.exit(1);
	}

	// Ensure directory exists
	await mkdir(dirname(fileURLToPath(outputPath)), { recursive: true });

	// Write the spec
	await writeFile(fileURLToPath(outputPath), JSON.stringify(spec, null, 2));
	console.log(`Generated OpenAPI spec with ${routeCount} routes -> ${fileURLToPath(outputPath)}`);
} catch (err) {
	console.error('Failed to generate OpenAPI spec:', err.message);
	process.exit(1);
}
