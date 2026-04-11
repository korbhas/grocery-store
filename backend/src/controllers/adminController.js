const db = require('../db/db');

// --- Products ---

exports.getProducts = async (req, res) => {
  try {
    const products = await db('products')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .select('products.*', 'categories.name as category_name')
      .orderBy('products.id', 'desc');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, category_id, price, unit, stock_qty, image_url } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });

    const [product] = await db('products').insert({
      name, description, category_id, price, unit, stock_qty, image_url,
    }).returning('*');

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, category_id, price, unit, stock_qty, image_url, is_active } = req.body;

    const [product] = await db('products')
      .where({ id: req.params.id })
      .update({ name, description, category_id, price, unit, stock_qty, image_url, is_active, updated_at: db.fn.now() })
      .returning('*');

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    // Soft delete — mark as inactive
    const [product] = await db('products')
      .where({ id: req.params.id })
      .update({ is_active: false, updated_at: db.fn.now() })
      .returning('*');

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Categories ---

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const [category] = await db('categories').insert({ name, slug }).returning('*');
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Orders ---

exports.getOrders = async (req, res) => {
  try {
    const { status, from, to } = req.query;
    let query = db('orders')
      .join('users', 'orders.user_id', 'users.id')
      .select('orders.*', 'users.name as customer_name', 'users.email as customer_email', 'users.phone as customer_phone')
      .orderBy('orders.created_at', 'desc');

    if (status) query = query.where('orders.status', status);
    if (from) query = query.where('orders.created_at', '>=', from);
    if (to) query = query.where('orders.created_at', '<=', to);

    const orders = await query;

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db('order_items')
          .join('products', 'order_items.product_id', 'products.id')
          .select('order_items.*', 'products.name', 'products.image_url')
          .where('order_items.order_id', order.id);
        const payment = await db('payments').where({ order_id: order.id }).first();
        return { ...order, items, payment };
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [order] = await db('orders')
      .where({ id: req.params.id })
      .update({ status, updated_at: db.fn.now() })
      .returning('*');

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
