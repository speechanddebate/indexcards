#!/usr/bin/env node
import { createOpenApiSpec } from '../api/routes/openapi/createOpenApiSpec.ts';
import apiRouter from '../api/routes/routers/v1/indexRouter.js';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import logger from '../api/helpers/logger.js';

const outputPath = new URL('../api/routes/openapi/openapi.json', import.meta.url);

try {
	const spec = createOpenApiSpec(apiRouter);

	// Strict validation
	const routeCount = Object.keys(spec.paths ?? {}).length;
	if (routeCount === 0) {
		logger.error('No routes in OpenAPI spec!');
		process.exit(1);
	}

	// Ensure directory exists
	await mkdir(dirname(fileURLToPath(outputPath)), { recursive: true });

	// Write the spec
	await writeFile(fileURLToPath(outputPath), JSON.stringify(spec, null, 2));
	logger.info(`Generated OpenAPI spec with ${routeCount} routes -> ${fileURLToPath(outputPath)}`);
} catch (err) {
	logger.error('Failed to generate OpenAPI spec:', err);
	process.exit(1);
}
process.exit(0);
