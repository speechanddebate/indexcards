import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		threads: true,
		globals: true,
		setupFiles: './tests/setup.js',
		globalSetup: './tests/globalTestSetup.js',
		coverage: {
			include: ['api/**/*.{js,ts,tsx}'],
			exclude: ['**/data/models/**'],
			cleanOnRerun: false,
			},
	},
});
