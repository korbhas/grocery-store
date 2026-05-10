const db = require('../db/db');
const { asyncHandler, AppError } = require('../utils/helpers');

exports.getCart = asyncHandler(async (req, res) => {
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
});

exports.addToCart = asyncHandler(async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) throw new AppError('product_id is required', 400);
  const qty = parseInt(quantity);
  if (!Number.isInteger(qty) || qty < 1) throw new AppError('quantity must be a positive integer', 400);

  const result = await db.transaction(async (trx) => {
    const product = await trx('products')
      .where({ id: product_id, is_active: true })
      .forUpdate()
      .first();

    if (!product) throw new AppError('Product not found', 404);
    if (product.stock_qty < qty) throw new AppError('Insufficient stock', 400);

    const existing = await trx('cart_items')
      .where({ user_id: req.dbUser.id, product_id })
      .forUpdate()
      .first();

    if (existing) {
      const newQty = existing.quantity + qty;
      if (product.stock_qty < newQty) throw new AppError('Insufficient stock', 400);
      await trx('cart_items').where({ id: existing.id }).update({ quantity: newQty });
    } else {
      await trx('cart_items').insert({ user_id: req.dbUser.id, product_id, quantity: qty });
    }

    return { message: 'Added to cart' };
  });

  res.json(result);
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const qty = parseInt(quantity);
  if (!Number.isInteger(qty)) throw new AppError('quantity must be an integer', 400);

  const result = await db.transaction(async (trx) => {
    const item = await trx('cart_items')
      .where({ id: req.params.id, user_id: req.dbUser.id })
      .forUpdate()
      .first();

    if (!item) throw new AppError('Cart item not found', 404);

    if (qty <= 0) {
      await trx('cart_items').where({ id: item.id }).del();
      return { message: 'Item removed' };
    }

    const product = await trx('products').where({ id: item.product_id }).forUpdate().first();
    if (product.stock_qty < qty) throw new AppError('Insufficient stock', 400);

    await trx('cart_items').where({ id: item.id }).update({ quantity: qty });
    return { message: 'Cart updated' };
  });

  res.json(result);
});

exports.removeCartItem = asyncHandler(async (req, res) => {
  const deleted = await db('cart_items')
    .where({ id: req.params.id, user_id: req.dbUser.id })
    .del();

  if (!deleted) return res.status(404).json({ error: 'Cart item not found' });
  res.json({ message: 'Item removed' });
});

exports.clearCart = asyncHandler(async (req, res) => {
  await db('cart_items').where({ user_id: req.dbUser.id }).del();
  res.json({ message: 'Cart cleared' });
});