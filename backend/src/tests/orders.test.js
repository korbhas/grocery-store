import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import app from '../app.js';
import { truncateAll, db } from './helpers/db.js';
import { createUser, createCategory, createProduct, tokenFor } from './helpers/factories.js';

const RAZORPAY_SECRET = 'test_razorpay_secret';

vi.mock('razorpay', () => ({
  default: vi.fn().mockImplementation(() => ({
    orders: {
      create: vi.fn().mockResolvedValue({
        id: 'rzp_order_test123',
        amount: 10000,
        currency: 'INR',
      }),
    },
  })),
}));

function makeSignature(razorpayOrderId, paymentId) {
  return crypto
    .createHmac('sha256', RAZORPAY_SECRET)
    .update(`${razorpayOrderId}|${paymentId}`)
    .digest('hex');
}

beforeEach(async () => {
  await truncateAll();
});

describe('POST /api/orders (authenticated)', () => {
  it('creates an order and returns a razorpay order id', async () => {
    const user = await createUser();
    const cat = await createCategory();
    const product = await createProduct({ category_id: cat.id, price: 100, stock_qty: 10 });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenFor(user)}`)
      .send({
        delivery_address: '123 Test Street',
        items: [{ product_id: product.id, quantity: 2 }],
      });

    expect(res.status).toBe(200);
    expect(res.body.order_id).toBeDefined();
    expect(res.body.razorpay_order_id).toBe('rzp_order_test123');
    expect(res.body.access_token).toBeDefined();
  });

  it('rejects when stock is insufficient', async () => {
    const user = await createUser();
    const product = await createProduct({ stock_qty: 1 });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenFor(user)}`)
      .send({
        delivery_address: '123 Test Street',
        items: [{ product_id: product.id, quantity: 5 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/insufficient stock/i);
  });

  it('rejects a non-existent product', async () => {
    const user = await createUser();

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenFor(user)}`)
      .send({
        delivery_address: '123 Test Street',
        items: [{ product_id: 99999, quantity: 1 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('rejects with no delivery address', async () => {
    const user = await createUser();
    const product = await createProduct();

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenFor(user)}`)
      .send({ items: [{ product_id: product.id, quantity: 1 }] });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/orders (guest)', () => {
  it('creates a guest order with name and email', async () => {
    const product = await createProduct({ price: 100, stock_qty: 10 });

    const res = await request(app)
      .post('/api/orders')
      .send({
        delivery_address: '123 Test Street',
        items: [{ product_id: product.id, quantity: 1 }],
        guest_name: 'Guest User',
        guest_email: 'guest@example.com',
      });

    expect(res.status).toBe(200);
    expect(res.body.order_id).toBeDefined();
  });

  it('rejects guest order without a name', async () => {
    const product = await createProduct();

    const res = await request(app)
      .post('/api/orders')
      .send({
        delivery_address: '123 Test Street',
        items: [{ product_id: product.id, quantity: 1 }],
        guest_email: 'guest@example.com',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });
});

describe('POST /api/orders/verify-payment', () => {
  it('marks order as processing and decrements stock', async () => {
    const user = await createUser();
    const product = await createProduct({ price: 100, stock_qty: 10 });

    const createRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenFor(user)}`)
      .send({
        delivery_address: '123 Test Street',
        items: [{ product_id: product.id, quantity: 3 }],
      });

    expect(createRes.status).toBe(200);
    const { razorpay_order_id, order_id } = createRes.body;
    const paymentId = 'pay_test_abc123';
    const signature = makeSignature(razorpay_order_id, paymentId);

    const verifyRes = await request(app)
      .post('/api/orders/verify-payment')
      .send({ razorpay_order_id, razorpay_payment_id: paymentId, razorpay_signature: signature });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.message).toMatch(/verified/i);

    const order = await db('orders').where({ id: order_id }).first();
    expect(order.status).toBe('processing');

    const updatedProduct = await db('products').where({ id: product.id }).first();
    expect(Number(updatedProduct.stock_qty)).toBe(7);
  });

  it('rejects an invalid signature with 400', async () => {
    const user = await createUser();
    const product = await createProduct({ price: 100, stock_qty: 10 });

    const createRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenFor(user)}`)
      .send({
        delivery_address: '123 Test Street',
        items: [{ product_id: product.id, quantity: 1 }],
      });

    const { razorpay_order_id } = createRes.body;

    const verifyRes = await request(app)
      .post('/api/orders/verify-payment')
      .send({
        razorpay_order_id,
        razorpay_payment_id: 'pay_test_abc123',
        razorpay_signature: 'not-a-valid-signature',
      });

    expect(verifyRes.status).toBe(400);
    expect(verifyRes.body.error).toMatch(/signature/i);
  });
});

describe('GET /api/orders/:id', () => {
  it('returns the order for the owning user', async () => {
    const user = await createUser();
    const product = await createProduct({ price: 100, stock_qty: 10 });

    const createRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenFor(user)}`)
      .send({
        delivery_address: '123 Test Street',
        items: [{ product_id: product.id, quantity: 1 }],
      });

    const { order_id, access_token } = createRes.body;

    const res = await request(app)
      .get(`/api/orders/${order_id}`)
      .query({ t: access_token });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(order_id);
    expect(res.body.items).toHaveLength(1);
  });

  it('returns 404 for a non-existent order', async () => {
    const res = await request(app)
      .get('/api/orders/99999')
      .query({ t: 'any-token' });

    expect(res.status).toBe(404);
  });
});
