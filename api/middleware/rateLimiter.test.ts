import express from 'express';
import request from 'supertest';

vi.mock('../config.js', () => ({
	default: {
		ratelimiter: {
			enabled: true,
			window: 1000,
			max: 2,
			message: {
				window: 1000,
				max: 1,
			},
			search: {
				window: 1000,
				max: 1,
			},
		},
	},
}));

async function makeApp() {
	vi.resetModules();

	const { rateLimiterMiddleware } = await import('./rateLimiter.js');

	const app = express();
	app.use(rateLimiterMiddleware);

	app.get('/v1/other', (_req, res) => res.json({ ok: true }));
	app.get('/v1/public/search', (_req, res) => res.json({ ok: true }));
	app.post('/v1/tab/123/message', (_req, res) => res.json({ ok: true }));
	app.post('/v1/tab/123/other', (_req, res) => res.json({ ok: true }));

	return app;
}

describe('rateLimiterMiddleware', () => {

	it('applies global limiter', async () => {
		const app = await makeApp();

		await request(app).get('/v1/other').expect(200);
		await request(app).get('/v1/other').expect(200);

		const res = await request(app).get('/v1/other').expect(429);
		expect(res).toBeProblemResponse(429);
	});

	it('applies search limiter', async () => {
		const app = await makeApp();

		await request(app).get('/v1/public/search').expect(200);
		const res = await request(app).get('/v1/public/search').expect(429);
		expect(res).toBeProblemResponse(429);
	});

	it('applies message limiter', async () => {
		const app = await makeApp();

		await request(app).post('/v1/tab/123/message').expect(200);
		const res = await request(app).post('/v1/tab/123/message').expect(429);
		expect(res).toBeProblemResponse(429);
	});

	it('does not apply message limiter to other routes', async () => {
		const app = await makeApp();

		await request(app).post('/v1/tab/123/other').expect(200);
		await request(app).post('/v1/tab/123/other').expect(200);
		const res = await request(app).post('/v1/tab/123/other').expect(429);
		expect(res).toBeProblemResponse(429);
	});
});
