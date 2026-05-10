import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

export async function createUser({ password = 'password123', ...rest } = {}) {
  const password_hash = await bcrypt.hash(password, 10);
  const [user] = await db('users').insert({
    name: 'Test User',
    email: `user_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`,
    role: 'customer',
    password_hash,
    ...rest,
  }).returning('*');
  return user;
}

export async function createAdmin(overrides = {}) {
  return createUser({ role: 'admin', email: 'admin@test.com', ...overrides });
}

export function tokenFor(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function createCategory(overrides = {}) {
  const ts = `${Date.now()}${Math.random().toString(36).slice(2)}`;
  const [cat] = await db('categories').insert({
    name: 'Test Category',
    slug: `test-cat-${ts}`,
    ...overrides,
  }).returning('*');
  return cat;
}

export async function createProduct(overrides = {}) {
  const [product] = await db('products').insert({
    name: 'Test Product',
    price: 100.00,
    stock_qty: 50,
    unit: 'piece',
    is_active: true,
    ...overrides,
  }).returning('*');
  return product;
}

export async function createCoupon(overrides = {}) {
  const ts = `${Date.now()}`;
  const [coupon] = await db('coupons').insert({
    code: `TEST${ts}`,
    description: 'Test coupon',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 0,
    max_uses: null,
    used_count: 0,
    is_active: true,
    starts_at: null,
    expires_at: null,
    ...overrides,
  }).returning('*');
  return coupon;
}
