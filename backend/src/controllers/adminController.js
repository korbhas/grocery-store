const db = require('../db/db');
const { asyncHandler, AppError, paginate } = require('../utils/helpers');

const VALID_ORDER_STATUSES = ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];

async function enrichOrdersWithCustomer(orderRows) {
  if (orderRows.length === 0) return [];

  const orderIds = orderRows.map((o) => o.id);

  const allItems = await db('order_items')
    .leftJoin('products', 'order_items.product_id', 'products.id')
    .select('order_items.*', 'products.name', 'products.image_url')
    .whereIn('order_items.order_id', orderIds);

  const allPayments = await db('payments')
    .whereIn('order_id', orderIds);

  const itemsByOrder = {};
  for (const item of allItems) {
    (itemsByOrder[item.order_id] = itemsByOrder[item.order_id] || []).push(item);
  }
  const paymentByOrder = {};
  for (const p of allPayments) {
    paymentByOrder[p.order_id] = p;
  }

  return orderRows.map((order) => ({
    ...order,
    items: itemsByOrder[order.id] || [],
    payment: paymentByOrder[order.id] || null,
  }));
}

// --- Dashboard ---

exports.getDashboard = asyncHandler(async (req, res) => {
  const [orderStats] = await db('orders')
    .count('id as total_orders')
    .sum('total_amount as total_revenue');

  const [{ total_users }] = await db('users').count('id as total_users');
  const [{ total_products }] = await db('products').count('id as total_products');

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const [currentPeriod] = await db('orders')
    .where('created_at', '>=', thirtyDaysAgo)
    .count('id as orders')
    .sum('total_amount as revenue');

  const [previousPeriod] = await db('orders')
    .where('created_at', '>=', sixtyDaysAgo)
    .where('created_at', '<', thirtyDaysAgo)
    .count('id as orders')
    .sum('total_amount as revenue');

  const revenueChange = previousPeriod.revenue
    ? ((currentPeriod.revenue - previousPeriod.revenue) / previousPeriod.revenue * 100).toFixed(1)
    : null;
  const ordersChange = previousPeriod.orders
    ? ((currentPeriod.orders - previousPeriod.orders) / previousPeriod.orders * 100).toFixed(1)
    : null;

  const revenueRows = await db('orders')
    .where('status', '!=', 'cancelled')
    .where('created_at', '>=', thirtyDaysAgo)
    .select(db.raw("DATE(created_at) as date"))
    .sum('total_amount as revenue')
    .groupBy(db.raw("DATE(created_at)"))
    .orderBy('date');

  const recentOrders = await db('orders')
    .leftJoin('users', 'orders.user_id', 'users.id')
    .select(
      'orders.id', 'orders.status', 'orders.total_amount', 'orders.created_at',
      'users.name as customer_name', 'users.email as customer_email',
      'orders.guest_name', 'orders.guest_email'
    )
    .orderBy('orders.created_at', 'desc')
    .limit(10);

  const lowStockProducts = await db('products')
    .where('is_active', true)
    .where('stock_qty', '<=', 5)
    .orderBy('stock_qty')
    .limit(10);

  const pendingOrders = await db('orders')
    .where('status', 'pending')
    .count('id as count')
    .first();

  res.json({
    stats: {
      total_revenue: parseFloat(orderStats.total_revenue) || 0,
      total_orders: parseInt(orderStats.total_orders) || 0,
      total_users: parseInt(total_users) || 0,
      total_products: parseInt(total_products) || 0,
      revenue_change: revenueChange,
      orders_change: ordersChange,
      pending_orders: parseInt(pendingOrders.count) || 0,
    },
    revenue_chart: revenueRows.map((r) => ({
      date: r.date,
      revenue: parseFloat(r.revenue) || 0,
    })),
    recent_orders: recentOrders,
    low_stock_products: lowStockProducts,
  });
});

// --- Products ---

exports.getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(200, Math.max(1, parseInt(limit) || 50));

  const products = await paginate(
    db('products')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .select('products.*', 'categories.name as category_name')
      .orderBy('products.id', 'desc'),
    p,
    l
  );

  const [{ count }] = await db('products').count('id as count');
  res.json({ products, total: parseInt(count), page: p, limit: l });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const { name, description, category_id, price, unit, stock_qty, image_url } = req.body;

  if (!name || name.trim().length === 0) throw new AppError('Name is required', 400);
  if (price === undefined || price === null || Number(price) < 0) throw new AppError('Price must be a non-negative number', 400);
  if (stock_qty !== undefined && Number(stock_qty) < 0) throw new AppError('stock_qty must be non-negative', 400);

  const [product] = await db('products').insert({
    name: name.trim(),
    description: description || null,
    category_id: category_id || null,
    price: Number(price),
    unit: unit || null,
    stock_qty: stock_qty !== undefined ? Number(stock_qty) : 0,
    image_url: image_url || null,
  }).returning('*');

  res.status(201).json(product);
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const { name, description, category_id, price, unit, stock_qty, image_url, is_active } = req.body;

  if (price !== undefined && Number(price) < 0) throw new AppError('Price must be a non-negative number', 400);
  if (stock_qty !== undefined && Number(stock_qty) < 0) throw new AppError('stock_qty must be non-negative', 400);

  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description;
  if (category_id !== undefined) updates.category_id = category_id || null;
  if (price !== undefined) updates.price = Number(price);
  if (unit !== undefined) updates.unit = unit;
  if (stock_qty !== undefined) updates.stock_qty = Number(stock_qty);
  if (image_url !== undefined) updates.image_url = image_url;
  if (is_active !== undefined) updates.is_active = is_active;
  updates.updated_at = db.fn.now();

  const [product] = await db('products')
    .where({ id: req.params.id })
    .update(updates)
    .returning('*');

  if (!product) throw new AppError('Product not found', 404);
  res.json(product);
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const [product] = await db('products')
    .where({ id: req.params.id })
    .update({ is_active: false, updated_at: db.fn.now() })
    .returning('*');

  if (!product) throw new AppError('Product not found', 404);
  res.json({ message: 'Product deactivated' });
});

// --- Categories ---

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await db('categories')
    .leftJoin('products', 'categories.id', 'products.category_id')
    .select('categories.*')
    .count('products.id as product_count')
    .groupBy('categories.id')
    .orderBy('categories.sort_order', 'asc')
    .orderBy('categories.name', 'asc');

  res.json(categories);
});

exports.createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length === 0) throw new AppError('Name is required', 400);

  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const existing = await db('categories').where({ slug }).first();
  if (existing) throw new AppError('A category with this name already exists', 409);

  const [{ maxSort }] = await db('categories').max('sort_order as maxSort');
  const sort_order = (maxSort || 0) + 1;

  const [category] = await db('categories').insert({
    name: name.trim(),
    slug,
    sort_order,
  }).returning('*');

  res.status(201).json(category);
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length === 0) throw new AppError('Name is required', 400);

  const category = await db('categories').where({ id: req.params.id }).first();
  if (!category) throw new AppError('Category not found', 404);

  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const duplicate = await db('categories').where({ slug }).whereNot({ id: req.params.id }).first();
  if (duplicate) throw new AppError('A category with this name already exists', 409);

  const [updated] = await db('categories')
    .where({ id: req.params.id })
    .update({ name: name.trim(), slug, updated_at: db.fn.now() })
    .returning('*');

  res.json(updated);
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await db('categories').where({ id: req.params.id }).first();
  if (!category) throw new AppError('Category not found', 404);

  const [{ count }] = await db('products').where({ category_id: req.params.id }).count('id as count');
  if (parseInt(count) > 0) {
    throw new AppError(`Cannot delete category with ${parseInt(count)} products. Reassign products first.`, 400);
  }

  await db('categories').where({ id: req.params.id }).del();
  res.json({ message: 'Category deleted' });
});

exports.reorderCategories = asyncHandler(async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) throw new AppError('order must be an array of category IDs', 400);

  for (let i = 0; i < order.length; i++) {
    await db('categories').where({ id: order[i] }).update({ sort_order: i });
  }

  res.json({ message: 'Categories reordered' });
});

// --- Orders ---

exports.getOrders = asyncHandler(async (req, res) => {
  const { status, from, to, page = 1, limit = 50 } = req.query;
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(200, Math.max(1, parseInt(limit) || 50));

  let query = db('orders')
    .leftJoin('users', 'orders.user_id', 'users.id')
    .select(
      'orders.*',
      'users.name as customer_name',
      'users.email as customer_email',
      'users.phone as customer_phone'
    );

  if (status) query = query.where('orders.status', status);
  if (from) query = query.where('orders.created_at', '>=', from);
  if (to) query = query.where('orders.created_at', '<=', to);

  let countQuery = db('orders');
  if (status) countQuery = countQuery.where('status', status);
  if (from) countQuery = countQuery.where('created_at', '>=', from);
  if (to) countQuery = countQuery.where('created_at', '<=', to);
  const [{ count }] = await countQuery.count('id as count');

  const orderRows = await paginate(query.orderBy('orders.created_at', 'desc'), p, l);

  const result = await enrichOrdersWithCustomer(orderRows);
  res.json({ orders: result, total: parseInt(count), page: p, limit: l });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VALID_ORDER_STATUSES.includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const updates = { status, updated_at: db.fn.now() };

  if (status === 'out_for_delivery') {
    const etaMinutes = 5 + Math.floor(Math.random() * 11);
    updates.estimated_delivery = new Date(Date.now() + etaMinutes * 60000);
  } else if (status === 'delivered' || status === 'cancelled') {
    updates.estimated_delivery = null;
  }

  if (status === 'refunded') {
    updates.estimated_delivery = null;
    await db('payments').where({ order_id: req.params.id }).update({ status: 'failed', updated_at: db.fn.now() });
  }

  const [order] = await db('orders')
    .where({ id: req.params.id })
    .update(updates)
    .returning('*');

  if (!order) throw new AppError('Order not found', 404);
  res.json(order);
});

// --- Users ---

exports.getUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 50 } = req.query;
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(200, Math.max(1, parseInt(limit) || 50));

  let query = db('users')
    .select('id', 'name', 'email', 'phone', 'role', 'is_banned', 'created_at')
    .orderBy('created_at', 'desc');

  if (role) query = query.where('role', role);
  if (search) {
    const term = `%${search}%`;
    query = query.where(function () {
      this.whereILike('name', term).orWhereILike('email', term);
    });
  }

  const countQuery = query.clone();
  const [{ count }] = await countQuery.count('id as count');

  const users = await paginate(query, p, l);
  res.json({ users, total: parseInt(count), page: p, limit: l });
});

exports.getUser = asyncHandler(async (req, res) => {
  const user = await db('users').where({ id: req.params.id }).first();
  if (!user) throw new AppError('User not found', 404);

  const orderStats = await db('orders')
    .where({ user_id: req.params.id })
    .count('id as total_orders')
    .sum('total_amount as total_spent')
    .first();

  const recentOrders = await db('orders')
    .where({ user_id: req.params.id })
    .orderBy('created_at', 'desc')
    .limit(5);

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    is_banned: user.is_banned,
    created_at: user.created_at,
    stats: {
      total_orders: parseInt(orderStats.total_orders) || 0,
      total_spent: parseFloat(orderStats.total_spent) || 0,
    },
    recent_orders: recentOrders,
  });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { name, role, phone } = req.body;

  if (role && !['customer', 'admin'].includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  const user = await db('users').where({ id: req.params.id }).first();
  if (!user) throw new AppError('User not found', 404);

  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (role !== undefined) updates.role = role;
  if (phone !== undefined) updates.phone = phone;
  if (is_banned !== undefined) updates.is_banned = is_banned;
  updates.updated_at = db.fn.now();

  const [updated] = await db('users').where({ id: req.params.id }).update(updates).returning('*');
  res.json({ id: updated.id, name: updated.name, email: updated.email, phone: updated.phone, role: updated.role });
});

// --- Settings ---

exports.getSettings = asyncHandler(async (req, res) => {
  const rows = await db('settings').orderBy('key');
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  res.json(settings);
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const allowedKeys = ['store_name', 'delivery_fee', 'min_order_amount', 'delivery_eta_min', 'delivery_eta_max', 'store_open'];
  const updates = req.body;

  for (const [key, value] of Object.entries(updates)) {
    if (!allowedKeys.includes(key)) continue;
    const strValue = String(value);
    await db('settings')
      .where({ key })
      .update({ value: strValue, updated_at: db.fn.now() });
  }

  const rows = await db('settings').orderBy('key');
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  res.json(settings);
});

// --- Inventory ---

exports.getInventory = asyncHandler(async (req, res) => {
  const { search, stock_filter, page = 1, limit = 50 } = req.query;
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(200, Math.max(1, parseInt(limit) || 50));

  let query = db('products')
    .leftJoin('categories', 'products.category_id', 'categories.id')
    .select('products.*', 'categories.name as category_name')
    .orderBy('products.stock_qty', 'asc');

  if (search) {
    const term = `%${search}%`;
    query = query.where(function () {
      this.whereILike('products.name', term);
    });
  }

  if (stock_filter === 'low') {
    query = query.where('products.stock_qty', '<=', 10).where('products.stock_qty', '>', 0);
  } else if (stock_filter === 'out') {
    query = query.where('products.stock_qty', '=', 0);
  } else if (stock_filter === 'in_stock') {
    query = query.where('products.stock_qty', '>', 10);
  }

  const countQuery = query.clone();
  const [{ count }] = await countQuery.count('products.id as count');

  const products = await paginate(query, p, l);
  res.json({ products, total: parseInt(count), page: p, limit: l });
});

exports.updateStock = asyncHandler(async (req, res) => {
  const { updates } = req.body;
  if (!Array.isArray(updates)) throw new AppError('updates must be an array of {id, stock_qty}', 400);

  const results = [];
  for (const item of updates) {
    if (!item.id || item.stock_qty === undefined || Number(item.stock_qty) < 0) {
      throw new AppError('Each update must have id and non-negative stock_qty', 400);
    }
    const [product] = await db('products')
      .where({ id: item.id })
      .update({ stock_qty: Number(item.stock_qty), updated_at: db.fn.now() })
      .returning('*');
    if (product) results.push(product);
  }

  res.json({ updated: results.length, products: results });
});

// --- Delivery Agents ---

exports.getDeliveryAgents = asyncHandler(async (req, res) => {
  const agents = await db('delivery_agents').orderBy('created_at', 'desc');
  res.json(agents);
});

exports.createDeliveryAgent = asyncHandler(async (req, res) => {
  const { name, phone, vehicle_type } = req.body;
  if (!name || !name.trim()) throw new AppError('Name is required', 400);
  if (!phone || !phone.trim()) throw new AppError('Phone is required', 400);

  const [agent] = await db('delivery_agents').insert({
    name: name.trim(),
    phone: phone.trim(),
    vehicle_type: vehicle_type || 'bike',
  }).returning('*');

  res.status(201).json(agent);
});

exports.updateDeliveryAgent = asyncHandler(async (req, res) => {
  const { name, phone, vehicle_type, is_active } = req.body;

  const agent = await db('delivery_agents').where({ id: req.params.id }).first();
  if (!agent) throw new AppError('Delivery agent not found', 404);

  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (phone !== undefined) updates.phone = phone.trim();
  if (vehicle_type !== undefined) updates.vehicle_type = vehicle_type;
  if (is_active !== undefined) updates.is_active = is_active;
  updates.updated_at = db.fn.now();

  const [updated] = await db('delivery_agents').where({ id: req.params.id }).update(updates).returning('*');
  res.json(updated);
});

exports.deleteDeliveryAgent = asyncHandler(async (req, res) => {
  const agent = await db('delivery_agents').where({ id: req.params.id }).first();
  if (!agent) throw new AppError('Delivery agent not found', 404);

  await db('delivery_agents').where({ id: req.params.id }).del();
  res.json({ message: 'Delivery agent deleted' });
});

exports.assignDeliveryAgent = asyncHandler(async (req, res) => {
  const { agent_id } = req.body;

  const order = await db('orders').where({ id: req.params.id }).first();
  if (!order) throw new AppError('Order not found', 404);

  if (agent_id) {
    const agent = await db('delivery_agents').where({ id: agent_id }).first();
    if (!agent) throw new AppError('Delivery agent not found', 404);
    if (!agent.is_active) throw new AppError('Delivery agent is not active', 400);
  }

  const [updated] = await db('orders')
    .where({ id: req.params.id })
    .update({ delivery_agent_id: agent_id || null, updated_at: db.fn.now() })
    .returning('*');

  res.json(updated);
});

// --- Coupons ---

exports.getCoupons = asyncHandler(async (req, res) => {
  const { is_active, page = 1, limit = 50 } = req.query;
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(200, Math.max(1, parseInt(limit) || 50));

  let query = db('coupons').orderBy('created_at', 'desc');

  if (is_active === 'true') query = query.where('is_active', true);
  else if (is_active === 'false') query = query.where('is_active', false);

  const countQuery = query.clone();
  const [{ count }] = await countQuery.count('id as count');

  const coupons = await paginate(query, p, l);
  res.json({ coupons, total: parseInt(count), page: p, limit: l });
});

exports.getCoupon = asyncHandler(async (req, res) => {
  const coupon = await db('coupons').where({ id: req.params.id }).first();
  if (!coupon) throw new AppError('Coupon not found', 404);
  res.json(coupon);
});

exports.createCoupon = asyncHandler(async (req, res) => {
  const { code, description, discount_type, discount_value, min_order_amount, max_uses, starts_at, expires_at } = req.body;

  if (!code || !code.trim()) throw new AppError('Coupon code is required', 400);
  if (!discount_type || !['percentage', 'fixed'].includes(discount_type)) throw new AppError('discount_type must be percentage or fixed', 400);
  if (discount_value === undefined || Number(discount_value) <= 0) throw new AppError('discount_value must be positive', 400);
  if (discount_type === 'percentage' && Number(discount_value) > 100) throw new AppError('Percentage discount cannot exceed 100', 400);

  const existing = await db('coupons').where({ code: code.trim().toUpperCase() }).first();
  if (existing) throw new AppError('Coupon code already exists', 409);

  const [coupon] = await db('coupons').insert({
    code: code.trim().toUpperCase(),
    description: description || null,
    discount_type,
    discount_value: Number(discount_value),
    min_order_amount: min_order_amount ? Number(min_order_amount) : 0,
    max_uses: max_uses || null,
    starts_at: starts_at || null,
    expires_at: expires_at || null,
  }).returning('*');

  res.status(201).json(coupon);
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await db('coupons').where({ id: req.params.id }).first();
  if (!coupon) throw new AppError('Coupon not found', 404);

  const { code, description, discount_type, discount_value, min_order_amount, max_uses, is_active, starts_at, expires_at } = req.body;

  if (discount_type && !['percentage', 'fixed'].includes(discount_type)) throw new AppError('discount_type must be percentage or fixed', 400);
  if (discount_value !== undefined && Number(discount_value) <= 0) throw new AppError('discount_value must be positive', 400);
  if (discount_type === 'percentage' && Number(discount_value) > 100) throw new AppError('Percentage discount cannot exceed 100', 400);

  if (code) {
    const duplicate = await db('coupons').where({ code: code.trim().toUpperCase() }).whereNot({ id: req.params.id }).first();
    if (duplicate) throw new AppError('Coupon code already exists', 409);
  }

  const updates = {};
  if (code !== undefined) updates.code = code.trim().toUpperCase();
  if (description !== undefined) updates.description = description;
  if (discount_type !== undefined) updates.discount_type = discount_type;
  if (discount_value !== undefined) updates.discount_value = Number(discount_value);
  if (min_order_amount !== undefined) updates.min_order_amount = Number(min_order_amount);
  if (max_uses !== undefined) updates.max_uses = max_uses;
  if (is_active !== undefined) updates.is_active = is_active;
  if (starts_at !== undefined) updates.starts_at = starts_at || null;
  if (expires_at !== undefined) updates.expires_at = expires_at || null;
  updates.updated_at = db.fn.now();

  const [updated] = await db('coupons').where({ id: req.params.id }).update(updates).returning('*');
  res.json(updated);
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await db('coupons').where({ id: req.params.id }).first();
  if (!coupon) throw new AppError('Coupon not found', 404);

  await db('coupons').where({ id: req.params.id }).del();
  res.json({ message: 'Coupon deleted' });
});

// --- Payments ---

exports.getPayments = asyncHandler(async (req, res) => {
  const { status, from, to, page = 1, limit = 50 } = req.query;
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(200, Math.max(1, parseInt(limit) || 50));

  let query = db('payments')
    .leftJoin('orders', 'payments.order_id', 'orders.id')
    .select('payments.*', 'orders.total_amount as order_total', 'orders.status as order_status');

  if (status) query = query.where('payments.status', status);
  if (from) query = query.where('payments.created_at', '>=', from);
  if (to) query = query.where('payments.created_at', '<=', to);

  const countQuery = query.clone();
  const [{ count }] = await countQuery.count('payments.id as count');

  const payments = await paginate(query.orderBy('payments.created_at', 'desc'), p, l);
  res.json({ payments, total: parseInt(count), page: p, limit: l });
});

exports.getPayment = asyncHandler(async (req, res) => {
  const payment = await db('payments')
    .leftJoin('orders', 'payments.order_id', 'orders.id')
    .leftJoin('users', 'orders.user_id', 'users.id')
    .select('payments.*', 'orders.total_amount as order_total', 'orders.status as order_status', 'orders.delivery_address', 'orders.created_at as order_created_at', 'users.name as customer_name', 'users.email as customer_email')
    .where('payments.id', req.params.id)
    .first();

  if (!payment) throw new AppError('Payment not found', 404);

  const items = await db('order_items')
    .leftJoin('products', 'order_items.product_id', 'products.id')
    .select('order_items.*', 'products.name as product_name')
    .where('order_items.order_id', payment.order_id);

  res.json({ ...payment, items });
});

// --- Delivery Areas ---

exports.getDeliveryAreas = asyncHandler(async (req, res) => {
  const areas = await db('delivery_areas').orderBy('created_at', 'desc');
  res.json(areas);
});

exports.createDeliveryArea = asyncHandler(async (req, res) => {
  const { pincode, area_name } = req.body;
  if (!pincode || !pincode.trim()) throw new AppError('Pincode is required', 400);
  if (!area_name || !area_name.trim()) throw new AppError('Area name is required', 400);

  const existing = await db('delivery_areas').where({ pincode: pincode.trim() }).first();
  if (existing) throw new AppError('Pincode already exists', 409);

  const [area] = await db('delivery_areas').insert({
    pincode: pincode.trim(),
    area_name: area_name.trim(),
  }).returning('*');

  res.status(201).json(area);
});

exports.updateDeliveryArea = asyncHandler(async (req, res) => {
  const { pincode, area_name, is_active } = req.body;

  const area = await db('delivery_areas').where({ id: req.params.id }).first();
  if (!area) throw new AppError('Delivery area not found', 404);

  if (pincode) {
    const duplicate = await db('delivery_areas').where({ pincode: pincode.trim() }).whereNot({ id: req.params.id }).first();
    if (duplicate) throw new AppError('Pincode already exists', 409);
  }

  const updates = {};
  if (pincode !== undefined) updates.pincode = pincode.trim();
  if (area_name !== undefined) updates.area_name = area_name.trim();
  if (is_active !== undefined) updates.is_active = is_active;
  updates.updated_at = db.fn.now();

  const [updated] = await db('delivery_areas').where({ id: req.params.id }).update(updates).returning('*');
  res.json(updated);
});

exports.deleteDeliveryArea = asyncHandler(async (req, res) => {
  const area = await db('delivery_areas').where({ id: req.params.id }).first();
  if (!area) throw new AppError('Delivery area not found', 404);

  await db('delivery_areas').where({ id: req.params.id }).del();
  res.json({ message: 'Delivery area deleted' });
});

// --- Dashboard (enhanced with period) ---

exports.getDashboardPeriod = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;

  let startDate;
  let prevStartDate;
  const now = new Date();

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      prevStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      break;
    case 'week': {
      const dayOfWeek = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    }
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }

  const [currentStats] = await db('orders')
    .where('status', '!=', 'cancelled')
    .where('created_at', '>=', startDate)
    .count('id as orders')
    .sum('total_amount as revenue');

  const [prevStats] = await db('orders')
    .where('status', '!=', 'cancelled')
    .where('created_at', '>=', prevStartDate)
    .where('created_at', '<', startDate)
    .count('id as orders')
    .sum('total_amount as revenue');

  const revenueChange = prevStats.revenue
    ? ((currentStats.revenue - prevStats.revenue) / prevStats.revenue * 100).toFixed(1)
    : null;
  const ordersChange = prevStats.orders
    ? ((currentStats.orders - prevStats.orders) / prevStats.orders * 100).toFixed(1)
    : null;

  const [{ total_users }] = await db('users').count('id as total_users');
  const [{ total_products }] = await db('products').count('id as total_products');

  const revenueRows = await db('orders')
    .where('status', '!=', 'cancelled')
    .where('created_at', '>=', startDate)
    .select(db.raw("DATE(created_at) as date"))
    .sum('total_amount as revenue')
    .groupBy(db.raw("DATE(created_at)"))
    .orderBy('date');

  const prevRevenueRows = await db('orders')
    .where('status', '!=', 'cancelled')
    .where('created_at', '>=', prevStartDate)
    .where('created_at', '<', startDate)
    .select(db.raw("DATE(created_at) as date"))
    .sum('total_amount as revenue')
    .groupBy(db.raw("DATE(created_at)"))
    .orderBy('date');

  const recentOrders = await db('orders')
    .leftJoin('users', 'orders.user_id', 'users.id')
    .select(
      'orders.id', 'orders.status', 'orders.total_amount', 'orders.created_at',
      'users.name as customer_name', 'users.email as customer_email',
      'orders.guest_name', 'orders.guest_email'
    )
    .orderBy('orders.created_at', 'desc')
    .limit(10);

  const lowStockProducts = await db('products')
    .where('is_active', true)
    .where('stock_qty', '<=', 10)
    .orderBy('stock_qty')
    .limit(10);

  const pendingOrders = await db('orders')
    .where('status', 'pending')
    .count('id as count')
    .first();

  res.json({
    stats: {
      total_revenue: parseFloat(currentStats.revenue) || 0,
      total_orders: parseInt(currentStats.orders) || 0,
      total_users: parseInt(total_users) || 0,
      total_products: parseInt(total_products) || 0,
      revenue_change: revenueChange,
      orders_change: ordersChange,
      pending_orders: parseInt(pendingOrders.count) || 0,
    },
    revenue_chart: revenueRows.map((r) => ({
      date: r.date,
      revenue: parseFloat(r.revenue) || 0,
    })),
    prev_revenue_chart: prevRevenueRows.map((r) => ({
      date: r.date,
      revenue: parseFloat(r.revenue) || 0,
    })),
    recent_orders: recentOrders,
    low_stock_products: lowStockProducts,
  });
});
// --- Product Variants ---

exports.getVariants = asyncHandler(async (req, res) => {
  const variants = await db('product_variants')
    .where({ product_id: req.params.id })
    .orderBy('sort_order')
    .orderBy('id');
  res.json(variants);
});

exports.createVariant = asyncHandler(async (req, res) => {
  const { name, price, stock_qty, is_default, sort_order } = req.body;
  if (!name || !name.trim()) throw new AppError('Variant name is required', 400);
  if (price === undefined || Number(price) < 0) throw new AppError('Price must be a non-negative number', 400);

  if (is_default) {
    await db('product_variants').where({ product_id: req.params.id }).update({ is_default: false });
  }

  const [variant] = await db('product_variants').insert({
    product_id: req.params.id,
    name: name.trim(),
    price: Number(price),
    stock_qty: stock_qty !== undefined ? Number(stock_qty) : 0,
    is_default: is_default || false,
    sort_order: sort_order || 0,
  }).returning('*');

  res.status(201).json(variant);
});

exports.updateVariant = asyncHandler(async (req, res) => {
  const { name, price, stock_qty, is_default, sort_order } = req.body;
  if (price !== undefined && Number(price) < 0) throw new AppError('Price must be a non-negative number', 400);

  if (is_default) {
    await db('product_variants').where({ product_id: req.params.id }).update({ is_default: false });
  }

  const updates = { updated_at: db.fn.now() };
  if (name !== undefined) updates.name = name.trim();
  if (price !== undefined) updates.price = Number(price);
  if (stock_qty !== undefined) updates.stock_qty = Number(stock_qty);
  if (is_default !== undefined) updates.is_default = is_default;
  if (sort_order !== undefined) updates.sort_order = sort_order;

  const [variant] = await db('product_variants')
    .where({ id: req.params.variantId, product_id: req.params.id })
    .update(updates)
    .returning('*');

  if (!variant) throw new AppError('Variant not found', 404);
  res.json(variant);
});

exports.deleteVariant = asyncHandler(async (req, res) => {
  const deleted = await db('product_variants')
    .where({ id: req.params.variantId, product_id: req.params.id })
    .del();
  if (!deleted) throw new AppError('Variant not found', 404);
  res.json({ message: 'Variant deleted' });
});
