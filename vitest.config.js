import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		threads: true,
		globals: true,
		globalSetup: './tests/globalTestSetup.js',
		coverage: {
			enabled: true,
			reporter: ['text', 'html'],
			exclude: [
				'node_modules/',
			],
		},
	},
});
