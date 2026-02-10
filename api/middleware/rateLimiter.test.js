import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../../config/config.js', () => ({
  default: {
    RATE_WINDOW: 1000,
    RATE_MAX: 2,
    MESSAGE_RATE_WINDOW: 1000,
    MESSAGE_RATE_MAX: 1,
    SEARCH_RATE_WINDOW: 1000,
    SEARCH_RATE_MAX: 1,
  },
}));

async function makeApp() {
  vi.resetModules();

  const { rateLimiterMiddleware } = await import('./rateLimiter.js');

  const app = express();
  app.use(rateLimiterMiddleware);

  app.get('/v1/other', (req, res) => res.json({ ok: true }));
  app.get('/v1/public/search', (req, res) => res.json({ ok: true }));
  app.post('/v1/tab/123/message', (req, res) => res.json({ ok: true }));
  app.post('/v1/tab/123/other', (req, res) => res.json({ ok: true }));

  return app;
}

describe('rateLimiterMiddleware', () => {

  it('applies global limiter', async () => {
    const app = await makeApp();

    await request(app).get('/v1/other').expect(200);
    await request(app).get('/v1/other').expect(200);

    await request(app).get('/v1/other').expect(429);
  });

  it('applies search limiter', async () => {
    const app = await makeApp();

    await request(app).get('/v1/public/search').expect(200);
    await request(app).get('/v1/public/search').expect(429);
  });

  it('applies message limiter', async () => {
    const app = await makeApp();

    await request(app).post('/v1/tab/123/message').expect(200);
    await request(app).post('/v1/tab/123/message').expect(429);
  });

  it('does not apply message limiter to other routes', async () => {
    const app = await makeApp();

    await request(app).post('/v1/tab/123/other').expect(200);
    await request(app).post('/v1/tab/123/other').expect(200);
    await request(app).post('/v1/tab/123/other').expect(429);
  });
});
