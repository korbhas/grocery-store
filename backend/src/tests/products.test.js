import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { truncateAll } from './helpers/db.js';
import { createCategory, createProduct } from './helpers/factories.js';

beforeEach(async () => {
  await truncateAll();
});

describe('GET /api/products/categories', () => {
  it('returns all categories', async () => {
    await createCategory({ name: 'Fruits', slug: 'fruits' });
    await createCategory({ name: 'Dairy', slug: 'dairy' });

    const res = await request(app).get('/api/products/categories');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map(c => c.name)).toEqual(expect.arrayContaining(['Fruits', 'Dairy']));
  });

  it('returns an empty array when no categories exist', async () => {
    const res = await request(app).get('/api/products/categories');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/products', () => {
  it('returns all active products', async () => {
    await createProduct({ name: 'Apple', is_active: true });
    await createProduct({ name: 'Banana', is_active: true });
    await createProduct({ name: 'Hidden', is_active: false });

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.products.map(p => p.name)).toEqual(expect.arrayContaining(['Apple', 'Banana']));
    expect(res.body.products.map(p => p.name)).not.toContain('Hidden');
  });

  it('filters by category slug', async () => {
    const fruits = await createCategory({ name: 'Fruits', slug: 'fruits' });
    const dairy = await createCategory({ name: 'Dairy', slug: 'dairy' });
    await createProduct({ name: 'Apple', category_id: fruits.id });
    await createProduct({ name: 'Milk', category_id: dairy.id });

    const res = await request(app).get('/api/products').query({ category: 'fruits' });

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.products[0].name).toBe('Apple');
  });

  it('searches by name', async () => {
    await createProduct({ name: 'Green Apple' });
    await createProduct({ name: 'Red Banana' });

    const res = await request(app).get('/api/products').query({ search: 'apple' });

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.products[0].name).toBe('Green Apple');
  });

  it('paginates results', async () => {
    for (let i = 0; i < 5; i++) {
      await createProduct({ name: `Product ${i}` });
    }

    const res = await request(app).get('/api/products').query({ page: 1, limit: 3 });

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(3);
    expect(res.body.total).toBe(5);
  });

  it('returns an empty list when nothing matches the search', async () => {
    await createProduct({ name: 'Apple' });

    const res = await request(app).get('/api/products').query({ search: 'xyz-no-match' });

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
  });
});

describe('GET /api/products/:id', () => {
  it('returns a single product by id', async () => {
    const product = await createProduct({ name: 'Apple', price: 50 });

    const res = await request(app).get(`/api/products/${product.id}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Apple');
    expect(parseFloat(res.body.price)).toBe(50);
  });

  it('returns 404 for a non-existent product', async () => {
    const res = await request(app).get('/api/products/99999');
    expect(res.status).toBe(404);
  });
});
