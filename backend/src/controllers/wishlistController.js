const db = require('../db/db');
const { asyncHandler, AppError } = require('../utils/helpers');

const getWishlist = asyncHandler(async (req, res) => {
  const items = await db('wishlists')
    .join('products', 'wishlists.product_id', 'products.id')
    .leftJoin('categories', 'products.category_id', 'categories.id')
    .where('wishlists.user_id', req.userId)
    .select(
      'products.id',
      'products.name',
      'products.price',
      'products.image_url',
      'products.unit',
      'products.stock_qty',
      'products.is_active',
      'categories.name as category_name',
      'wishlists.created_at as saved_at'
    );
  res.json(items);
});

const addToWishlist = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.productId);

  const product = await db('products').where({ id: productId }).first();
  if (!product) throw new AppError('Product not found', 404);

  await db('wishlists')
    .insert({ user_id: req.userId, product_id: productId })
    .onConflict(['user_id', 'product_id'])
    .ignore();

  res.status(201).json({ message: 'Added to wishlist' });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.productId);

  await db('wishlists').where({ user_id: req.userId, product_id: productId }).delete();

  res.json({ message: 'Removed from wishlist' });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
