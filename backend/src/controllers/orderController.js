const db = require('../db/db');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { delivery_address } = req.body;
    if (!delivery_address) return res.status(400).json({ error: 'Delivery address is required' });

    const cartItems = await db('cart_items')
      .join('products', 'cart_items.product_id', 'products.id')
      .select('cart_items.*', 'products.price', 'products.stock_qty', 'products.name')
      .where('cart_items.user_id', req.dbUser.id);

    if (cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    // Validate stock
    for (const item of cartItems) {
      if (item.stock_qty < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${item.name}` });
      }
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });

    // Create order in DB
    const [order] = await db('orders').insert({
      user_id: req.dbUser.id,
      status: 'pending',
      total_amount: totalAmount,
      delivery_address,
      razorpay_order_id: razorpayOrder.id,
    }).returning('*');

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price,
    }));
    await db('order_items').insert(orderItems);

    // Create payment record
    await db('payments').insert({
      order_id: order.id,
      amount: totalAmount,
      status: 'created',
    });

    res.json({
      order_id: order.id,
      razorpay_order_id: razorpayOrder.id,
      amount: totalAmount,
      currency: 'INR',
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const crypto = require('crypto');

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const order = await db('orders').where({ razorpay_order_id }).first();
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Update order status
    await db('orders').where({ id: order.id }).update({ status: 'processing' });

    // Update payment
    await db('payments').where({ order_id: order.id }).update({
      razorpay_payment_id,
      status: 'captured',
      paid_at: db.fn.now(),
    });

    // Reduce stock
    const items = await db('order_items').where({ order_id: order.id });
    for (const item of items) {
      await db('products').where({ id: item.product_id }).decrement('stock_qty', item.quantity);
    }

    // Clear cart
    await db('cart_items').where({ user_id: order.user_id }).del();

    res.json({ message: 'Payment verified', order_id: order.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await db('orders')
      .where({ user_id: req.dbUser.id })
      .orderBy('created_at', 'desc');

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db('order_items')
          .join('products', 'order_items.product_id', 'products.id')
          .select('order_items.*', 'products.name', 'products.image_url', 'products.unit')
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

exports.getOrder = async (req, res) => {
  try {
    const order = await db('orders')
      .where({ id: req.params.id, user_id: req.dbUser.id })
      .first();

    if (!order) return res.status(404).json({ error: 'Order not found' });

    const items = await db('order_items')
      .join('products', 'order_items.product_id', 'products.id')
      .select('order_items.*', 'products.name', 'products.image_url', 'products.unit')
      .where('order_items.order_id', order.id);

    const payment = await db('payments').where({ order_id: order.id }).first();

    res.json({ ...order, items, payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
