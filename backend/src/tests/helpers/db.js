import db from '../../db/db.js';

export async function truncateAll() {
  await db.raw(`
    TRUNCATE TABLE
      cart_items, order_items, payments, orders,
      products, categories, users,
      delivery_agents, coupons, delivery_areas
    RESTART IDENTITY CASCADE
  `);
}

export { db };
