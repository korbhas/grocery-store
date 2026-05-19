const db = require('../db/db');
const Razorpay = require('razorpay');
const { asyncHandler, AppError, crypto: cryptoModule } = require('../utils/helpers');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function enrichOrders(orderRows) {
  if (orderRows.length === 0) return [];

  const orderIds = orderRows.map((o) => o.id);

  const allItems = await db('order_items')
    .join('products', 'order_items.product_id', 'products.id')
    .select('order_items.*', 'products.name', 'products.image_url', 'products.unit')
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

  return orderRows.map((order) => {
    const { access_token, ...rest } = order;
    return {
      ...rest,
      items: itemsByOrder[order.id] || [],
      payment: paymentByOrder[order.id] || null,
    };
  });
}

exports.createOrder = asyncHandler(async (req, res) => {
  const { delivery_address, delivery_pincode, items, guest_name, guest_email, guest_phone, coupon_id } = req.body;
  if (!delivery_address || !delivery_address.trim()) {
    throw new AppError('Delivery address is required', 400);
  }

  if (delivery_pincode) {
    const area = await db('delivery_areas')
      .where({ pincode: String(delivery_pincode).trim(), is_active: true })
      .first();
    if (!area) throw new AppError(`We do not deliver to pincode ${delivery_pincode}`, 400);
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('Items are required', 400);
  }

  const userId = req.dbUser ? req.dbUser.id : null;

  if (!userId) {
    if (!guest_name || !guest_name.trim()) {
      throw new AppError('Name is required for guest checkout', 400);
    }
    if (!guest_email || !guest_email.trim()) {
      throw new AppError('Email is required for guest checkout', 400);
    }
  }

  const result = await db.transaction(async (trx) => {
    const productIds = items.map((i) => i.product_id);
    const products = await trx('products')
      .whereIn('id', productIds)
      .forUpdate();

    const productMap = {};
    for (const p of products) {
      productMap[p.id] = p;
    }

    const variantIds = items.filter((i) => i.variant_id).map((i) => i.variant_id);
    const variantMap = {};
    if (variantIds.length > 0) {
      const variants = await trx('product_variants').whereIn('id', variantIds).forUpdate();
      for (const v of variants) variantMap[v.id] = v;
    }

    const cartItems = items.map((item) => {
      const product = productMap[item.product_id];
      if (!product) throw new AppError(`Product ${item.product_id} not found`, 400);
      if (!product.is_active) throw new AppError(`${product.name} is no longer available`, 400);

      if (item.variant_id) {
        const variant = variantMap[item.variant_id];
        if (!variant || variant.product_id !== product.id) throw new AppError(`Invalid variant for ${product.name}`, 400);
        if (variant.stock_qty < item.quantity) throw new AppError(`Insufficient stock for ${product.name} (${variant.name})`, 400);
        return {
          product_id: product.id,
          variant_id: variant.id,
          variant_name: variant.name,
          quantity: item.quantity,
          price: parseFloat(variant.price),
          name: product.name,
        };
      }

      if (product.stock_qty < item.quantity) throw new AppError(`Insufficient stock for ${product.name}`, 400);
      return {
        product_id: product.id,
        variant_id: null,
        variant_name: null,
        quantity: item.quantity,
        price: parseFloat(product.price),
        name: product.name,
      };
    });

    let totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discountAmount = 0;
    let appliedCouponId = null;

    if (coupon_id) {
      const coupon = await trx('coupons').where({ id: coupon_id }).first();
      if (!coupon) throw new AppError('Invalid coupon', 400);
      if (!coupon.is_active) throw new AppError('Coupon is no longer active', 400);
      const now = new Date();
      if (coupon.starts_at && new Date(coupon.starts_at) > now) throw new AppError('Coupon is not yet active', 400);
      if (coupon.expires_at && new Date(coupon.expires_at) < now) throw new AppError('Coupon has expired', 400);
      if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) throw new AppError('Coupon has reached its usage limit', 400);
      if (totalAmount < Number(coupon.min_order_amount)) throw new AppError(`Minimum order amount is ₹${coupon.min_order_amount}`, 400);

      if (coupon.discount_type === 'percentage') {
        discountAmount = (totalAmount * Number(coupon.discount_value)) / 100;
      } else {
        discountAmount = Number(coupon.discount_value);
      }
      if (discountAmount > totalAmount) discountAmount = totalAmount;
      discountAmount = Math.round(discountAmount * 100) / 100;
      totalAmount = Math.round((totalAmount - discountAmount) * 100) / 100;
      appliedCouponId = coupon.id;

      await trx('coupons').where({ id: coupon.id }).increment('used_count', 1);
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });

    const orderData = {
      status: 'pending',
      total_amount: totalAmount,
      delivery_address: delivery_address.trim(),
      razorpay_order_id: razorpayOrder.id,
      access_token: cryptoModule.randomUUID(),
      coupon_id: appliedCouponId,
      discount_amount: discountAmount,
    };

    if (userId) {
      orderData.user_id = userId;
    } else {
      orderData.guest_name = guest_name.trim();
      orderData.guest_email = guest_email.trim();
      orderData.guest_phone = guest_phone ? guest_phone.trim() : null;
    }

    const [order] = await trx('orders').insert(orderData).returning('*');

    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      variant_name: item.variant_name || null,
      quantity: item.quantity,
      unit_price: item.price,
    }));
    await trx('order_items').insert(orderItems);

    await trx('payments').insert({
      order_id: order.id,
      amount: totalAmount,
      status: 'created',
    });

    if (userId) {
      await trx('cart_items').where({ user_id: userId }).del();
    }

    return {
      order_id: order.id,
      razorpay_order_id: razorpayOrder.id,
      amount: totalAmount,
      currency: 'INR',
      key_id: process.env.RAZORPAY_KEY_ID,
      access_token: order.access_token,
    };
  });

  res.json(result);
});

exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError('Missing payment verification fields', 400);
  }

  const expectedSignature = cryptoModule
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw new AppError('Invalid payment signature', 400);
  }

  const result = await db.transaction(async (trx) => {
    const order = await trx('orders').where({ razorpay_order_id }).forUpdate().first();
    if (!order) throw new AppError('Order not found', 404);

    const etaMinutes = 30 + Math.floor(Math.random() * 31);
    const estimatedDelivery = new Date(Date.now() + etaMinutes * 60000);

    await trx('orders').where({ id: order.id }).update({
      status: 'processing',
      estimated_delivery: estimatedDelivery,
    });

    await trx('payments').where({ order_id: order.id }).update({
      razorpay_payment_id,
      status: 'captured',
      paid_at: trx.fn.now(),
    });

    const items = await trx('order_items').where({ order_id: order.id });
    for (const item of items) {
      if (item.variant_id) {
        await trx('product_variants').where({ id: item.variant_id }).decrement('stock_qty', item.quantity);
      } else {
        await trx('products').where({ id: item.product_id }).decrement('stock_qty', item.quantity);
      }
    }

    if (order.user_id) {
      await trx('cart_items').where({ user_id: order.user_id }).del();
    }

    return { message: 'Payment verified', order_id: order.id };
  });

  res.json(result);
});

exports.getOrders = asyncHandler(async (req, res) => {
  const orderRows = await db('orders')
    .where({ user_id: req.dbUser.id })
    .orderBy('created_at', 'desc');

  res.json(await enrichOrders(orderRows));
});

exports.getOrder = asyncHandler(async (req, res) => {
  const accessToken = req.query.t;

  if (req.dbUser) {
    const order = await db('orders')
      .where({ id: req.params.id, user_id: req.dbUser.id })
      .first();
    if (!order) throw new AppError('Order not found', 404);
    return res.json((await enrichOrders([order]))[0]);
  }

  if (!accessToken) {
    throw new AppError('Access token is required for guest order access', 400);
  }

  const order = await db('orders')
    .where({ id: req.params.id, access_token: accessToken })
    .first();
  if (!order) throw new AppError('Order not found', 404);

  const result = (await enrichOrders([order]))[0];
  const { access_token, ...safe } = result;
  return res.json(safe);
});