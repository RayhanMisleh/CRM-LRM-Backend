/// <reference types="vitest" />

import request from 'supertest';
import type { Express } from 'express';

describe('GET /health', () => {
  let app: Express;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'file:memory:?cache=shared';
    process.env.DIRECT_URL = process.env.DIRECT_URL ?? 'file:memory:?cache=shared';
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
    process.env.RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS ?? '60000';
    process.env.RATE_LIMIT_MAX_REQUESTS = process.env.RATE_LIMIT_MAX_REQUESTS ?? '100';
    process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000';

    const module = await import('./app');
    app = module.default;
  });

  it('responds with service status details', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'OK',
      environment: 'test',
    });
    expect(typeof response.body.timestamp).toBe('string');
    expect(response.body.timestamp.length).toBeGreaterThan(0);
    expect(typeof response.body.uptime).toBe('number');
    expect(response.body.uptime).toBeGreaterThanOrEqual(0);
  });
});
