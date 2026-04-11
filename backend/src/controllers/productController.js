const db = require('../db/db');

exports.getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    let query = db('products')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
      .where('products.is_active', true);

    if (category) {
      query = query.where('categories.slug', category);
    }

    if (search) {
      query = query.where(function () {
        this.whereILike('products.name', `%${search}%`)
          .orWhereILike('products.description', `%${search}%`);
      });
    }

    const offset = (page - 1) * limit;
    const products = await query.orderBy('products.name').limit(limit).offset(offset);

    const [{ count }] = await db('products')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .where('products.is_active', true)
      .modify((qb) => {
        if (category) qb.where('categories.slug', category);
        if (search) {
          qb.where(function () {
            this.whereILike('products.name', `%${search}%`)
              .orWhereILike('products.description', `%${search}%`);
          });
        }
      })
      .count('products.id as count');

    res.json({ products, total: parseInt(count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await db('products')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .select('products.*', 'categories.name as category_name')
      .where('products.id', req.params.id)
      .first();

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await db('categories').orderBy('name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
