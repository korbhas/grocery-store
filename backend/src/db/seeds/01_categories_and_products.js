exports.seed = async function (knex) {
  await knex('cart_items').del();
  await knex('order_items').del();
  await knex('payments').del();
  await knex('orders').del();
  await knex('products').del();
  await knex('categories').del();

  const categories = await knex('categories').insert([
    { name: 'Fruits & Vegetables', slug: 'fruits-vegetables' },
    { name: 'Dairy & Eggs', slug: 'dairy-eggs' },
    { name: 'Grains & Staples', slug: 'grains-staples' },
    { name: 'Snacks & Beverages', slug: 'snacks-beverages' },
    { name: 'Spices & Condiments', slug: 'spices-condiments' },
    { name: 'Bakery', slug: 'bakery' },
  ]).returning('*');

  const catMap = {};
  categories.forEach((c) => { catMap[c.slug] = c.id; });

  await knex('products').insert([
    { name: 'Banana', description: 'Fresh yellow bananas', category_id: catMap['fruits-vegetables'], price: 40, unit: 'dozen', stock_qty: 100, image_url: '/images/banana.jpg' },
    { name: 'Tomato', description: 'Fresh red tomatoes', category_id: catMap['fruits-vegetables'], price: 30, unit: 'kg', stock_qty: 80, image_url: '/images/tomato.jpg' },
    { name: 'Onion', description: 'Fresh onions', category_id: catMap['fruits-vegetables'], price: 35, unit: 'kg', stock_qty: 120, image_url: '/images/onion.jpg' },
    { name: 'Apple', description: 'Shimla apples', category_id: catMap['fruits-vegetables'], price: 150, unit: 'kg', stock_qty: 60, image_url: '/images/apple.jpg' },
    { name: 'Milk (500ml)', description: 'Full cream milk', category_id: catMap['dairy-eggs'], price: 30, unit: 'packet', stock_qty: 200, image_url: '/images/milk.jpg' },
    { name: 'Eggs (6 pack)', description: 'Farm fresh eggs', category_id: catMap['dairy-eggs'], price: 50, unit: 'pack', stock_qty: 150, image_url: '/images/eggs.jpg' },
    { name: 'Paneer (200g)', description: 'Fresh cottage cheese', category_id: catMap['dairy-eggs'], price: 80, unit: 'pack', stock_qty: 40, image_url: '/images/paneer.jpg' },
    { name: 'Rice (5kg)', description: 'Basmati rice', category_id: catMap['grains-staples'], price: 350, unit: 'bag', stock_qty: 50, image_url: '/images/rice.jpg' },
    { name: 'Wheat Flour (5kg)', description: 'Whole wheat atta', category_id: catMap['grains-staples'], price: 250, unit: 'bag', stock_qty: 60, image_url: '/images/atta.jpg' },
    { name: 'Toor Dal (1kg)', description: 'Yellow lentils', category_id: catMap['grains-staples'], price: 140, unit: 'bag', stock_qty: 70, image_url: '/images/dal.jpg' },
    { name: 'Chips (Large)', description: 'Classic salted potato chips', category_id: catMap['snacks-beverages'], price: 50, unit: 'pack', stock_qty: 100, image_url: '/images/chips.jpg' },
    { name: 'Cola (2L)', description: 'Carbonated soft drink', category_id: catMap['snacks-beverages'], price: 90, unit: 'bottle', stock_qty: 80, image_url: '/images/cola.jpg' },
    { name: 'Turmeric Powder', description: 'Pure turmeric powder', category_id: catMap['spices-condiments'], price: 60, unit: '200g', stock_qty: 90, image_url: '/images/turmeric.jpg' },
    { name: 'Red Chili Powder', description: 'Spicy red chili powder', category_id: catMap['spices-condiments'], price: 70, unit: '200g', stock_qty: 85, image_url: '/images/chili.jpg' },
    { name: 'Bread', description: 'Whole wheat bread loaf', category_id: catMap['bakery'], price: 45, unit: 'loaf', stock_qty: 60, image_url: '/images/bread.jpg' },
  ]);
};
