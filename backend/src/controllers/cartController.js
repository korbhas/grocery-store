const db = require('../db/db');

exports.getCart = async (req, res) => {
  try {
    const items = await db('cart_items')
      .join('products', 'cart_items.product_id', 'products.id')
      .select(
        'cart_items.id',
        'cart_items.product_id',
        'cart_items.quantity',
        'products.name',
        'products.price',
        'products.unit',
        'products.image_url',
        'products.stock_qty'
      )
      .where('cart_items.user_id', req.dbUser.id);

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    const product = await db('products').where({ id: product_id, is_active: true }).first();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock_qty < quantity) return res.status(400).json({ error: 'Insufficient stock' });

    const existing = await db('cart_items')
      .where({ user_id: req.dbUser.id, product_id })
      .first();

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (product.stock_qty < newQty) return res.status(400).json({ error: 'Insufficient stock' });
      await db('cart_items').where({ id: existing.id }).update({ quantity: newQty });
    } else {
      await db('cart_items').insert({ user_id: req.dbUser.id, product_id, quantity });
    }

    res.json({ message: 'Added to cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await db('cart_items')
      .where({ id: req.params.id, user_id: req.dbUser.id })
      .first();

    if (!item) return res.status(404).json({ error: 'Cart item not found' });

    if (quantity <= 0) {
      await db('cart_items').where({ id: item.id }).del();
      return res.json({ message: 'Item removed' });
    }

    const product = await db('products').where({ id: item.product_id }).first();
    if (product.stock_qty < quantity) return res.status(400).json({ error: 'Insufficient stock' });

    await db('cart_items').where({ id: item.id }).update({ quantity });
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const deleted = await db('cart_items')
      .where({ id: req.params.id, user_id: req.dbUser.id })
      .del();

    if (!deleted) return res.status(404).json({ error: 'Cart item not found' });
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await db('cart_items').where({ user_id: req.dbUser.id }).del();
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
