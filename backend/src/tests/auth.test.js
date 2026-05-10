import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { truncateAll, db } from './helpers/db.js';
import { createUser, tokenFor } from './helpers/factories.js';

beforeEach(async () => {
  await truncateAll();
});

describe('POST /api/auth/register', () => {
  it('creates a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user.role).toBe('customer');
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('rejects a duplicate email with 409', async () => {
    await createUser({ email: 'alice@example.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already registered/i);
  });

  it('rejects a password shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'bob@example.com', password: '123' });

    expect(res.status).toBe(400);
  });

  it('rejects missing name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bob@example.com', password: 'password123' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns a token for valid credentials', async () => {
    await createUser({ email: 'alice@example.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alice@example.com');
  });

  it('rejects a wrong password with 401', async () => {
    await createUser({ email: 'alice@example.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('rejects a non-existent email with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(res.status).toBe(401);
  });

  it('rejects a banned user with 403', async () => {
    await createUser({ email: 'banned@example.com', password: 'password123', is_banned: true });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'banned@example.com', password: 'password123' });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/suspended/i);
  });
});

describe('GET /api/auth/me', () => {
  it('returns the authenticated user', async () => {
    const user = await createUser({ email: 'alice@example.com' });
    const token = tokenFor(user);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('alice@example.com');
    expect(res.body.password_hash).toBeUndefined();
  });

  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with a malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
  });
});
