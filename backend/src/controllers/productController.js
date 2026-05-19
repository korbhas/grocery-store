const db = require('../db/db');
const { escapeLike, paginate, asyncHandler } = require('../utils/helpers');

function applyFilters(query, { category, search }) {
  let q = query
    .leftJoin('categories', 'products.category_id', 'categories.id')
    .where('products.is_active', true);

  if (category) {
    q = q.where('categories.slug', category);
  }
  if (search) {
    const term = `%${escapeLike(search)}%`;
    q = q.where(function () {
      this.whereILike('products.name', term)
        .orWhereILike('products.description', term);
    });
  }
  return q;
}

exports.getProducts = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query;
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));

  const filtered = applyFilters(db('products'), { category, search });

  const products = await paginate(
    filtered.clone().select('products.*', 'categories.name as category_name', 'categories.slug as category_slug').orderBy('products.name'),
    p,
    l
  );

  if (products.length > 0) {
    const productIds = products.map((p) => p.id);
    const variants = await db('product_variants')
      .whereIn('product_id', productIds)
      .orderBy('sort_order').orderBy('id');

    const variantMap = {};
    for (const v of variants) {
      if (!variantMap[v.product_id]) variantMap[v.product_id] = [];
      variantMap[v.product_id].push(v);
    }
    for (const product of products) {
      product.variants = variantMap[product.id] || [];
    }
  }

  const [{ count }] = await applyFilters(db('products'), { category, search }).count('products.id as count');

  res.json({ products, total: parseInt(count), page: p, limit: l });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await db('products')
    .leftJoin('categories', 'products.category_id', 'categories.id')
    .select('products.*', 'categories.name as category_name')
    .where('products.id', req.params.id)
    .first();

  if (!product) return res.status(404).json({ error: 'Product not found' });

  product.variants = await db('product_variants')
    .where({ product_id: product.id })
    .orderBy('sort_order').orderBy('id');

  res.json(product);
});

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await db('categories').orderBy('name');
  res.json(categories);
});