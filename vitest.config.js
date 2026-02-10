import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		threads: true,
		globals: true,
		globalSetup: './tests/globalTestSetup.js',
		coverage: {
			cleanOnRerun: false,
			include: ['api/**/*.{js,ts,tsx}'],
			exclude: ['**/data/models/**'],
			reportOnFailure: true
			},
	},
});
