import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';

let app;
let initDb;

beforeAll(async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: 'Binary search',
                description: 'Find a target in a sorted array.',
                steps: [
                  {
                    id: 1,
                    heading: 'Idea',
                    description: 'Repeatedly halve the search space.',
                    interactionType: 'text',
                    content: { mainText: 'Compare middle to target.' },
                  },
                  {
                    id: 2,
                    heading: 'Try it',
                    description: 'Tap to highlight the middle index.',
                    interactionType: 'button_demo',
                    content: { buttonLabel: 'Highlight middle', result: 'Middle is highlighted.' },
                  },
                ],
              }),
            },
          },
        ],
      }),
    })),
  );

  const mod = await import('../server.js');
  app = mod.app;
  initDb = mod.initDb;
  await initDb();
});

describe('Auth API', () => {
  it('signs up a new user', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('user@example.com');
  });

  it('logs in', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejects invalid login', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

describe('Protected API', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });
    token = res.body.token;
  });

  it('generates and saves history', async () => {
    const res = await request(app)
      .post('/api/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ topic: 'Binary search' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Binary search');
    expect(res.body.data.historyId).toBeTruthy();
  });

  it('lists history', async () => {
    const res = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.history)).toBe(true);
    expect(res.body.history.length).toBeGreaterThan(0);
    expect(res.body.history[0].title).toBe('Binary search');
  });

  it('deletes a history item by id', async () => {
    const listBefore = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${token}`);
    const targetId = listBefore.body.history[0].id;

    const del = await request(app)
      .delete(`/api/history/${targetId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);
    expect(del.body.success).toBe(true);

    const getAfter = await request(app)
      .get(`/api/history/${targetId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getAfter.status).toBe(404);
  });
});
