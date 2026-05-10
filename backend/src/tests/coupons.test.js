import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { truncateAll } from './helpers/db.js';
import { createCoupon } from './helpers/factories.js';

beforeEach(async () => {
  await truncateAll();
});

describe('POST /api/coupons/validate', () => {
  it('returns discount details for a valid percentage coupon', async () => {
    const coupon = await createCoupon({ discount_type: 'percentage', discount_value: 10 });

    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: coupon.code, order_amount: 500 });

    expect(res.status).toBe(200);
    expect(res.body.discount_amount).toBe(50);
    expect(res.body.final_amount).toBe(450);
  });

  it('returns correct amount for a fixed-value coupon', async () => {
    const coupon = await createCoupon({ discount_type: 'fixed', discount_value: 75 });

    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: coupon.code, order_amount: 500 });

    expect(res.status).toBe(200);
    expect(res.body.discount_amount).toBe(75);
    expect(res.body.final_amount).toBe(425);
  });

  it('rejects an unknown coupon code', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'DOESNOTEXIST', order_amount: 500 });

    expect(res.status).toBe(400);
  });

  it('rejects an inactive coupon', async () => {
    const coupon = await createCoupon({ is_active: false });

    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: coupon.code, order_amount: 500 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/inactive/i);
  });

  it('rejects an expired coupon', async () => {
    const yesterday = new Date(Date.now() - 86400000);
    const coupon = await createCoupon({ expires_at: yesterday });

    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: coupon.code, order_amount: 500 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/expired/i);
  });

  it('rejects a coupon that has not started yet', async () => {
    const tomorrow = new Date(Date.now() + 86400000);
    const coupon = await createCoupon({ starts_at: tomorrow });

    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: coupon.code, order_amount: 500 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not yet active/i);
  });

  it('rejects when order amount is below the minimum', async () => {
    const coupon = await createCoupon({ min_order_amount: 1000 });

    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: coupon.code, order_amount: 200 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/minimum/i);
  });

  it('rejects a coupon that has reached its usage limit', async () => {
    const coupon = await createCoupon({ max_uses: 5, used_count: 5 });

    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: coupon.code, order_amount: 500 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/usage limit/i);
  });

  it('does not exceed the order amount for fixed coupons', async () => {
    const coupon = await createCoupon({ discount_type: 'fixed', discount_value: 1000 });

    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: coupon.code, order_amount: 100 });

    expect(res.status).toBe(200);
    expect(res.body.discount_amount).toBe(100);
    expect(res.body.final_amount).toBe(0);
  });
});
