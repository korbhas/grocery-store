exports.up = async function (knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('clerk_id').unique().notNullable();
    table.string('name');
    table.string('email');
    table.string('phone');
    table.enum('role', ['customer', 'admin']).defaultTo('customer');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('categories', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('slug').unique().notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
    table.decimal('price', 10, 2).notNullable();
    table.string('unit').defaultTo('piece');
    table.integer('stock_qty').defaultTo(0);
    table.string('image_url');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('orders', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.enum('status', ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled']).defaultTo('pending');
    table.decimal('total_amount', 10, 2).notNullable();
    table.text('delivery_address').notNullable();
    table.string('razorpay_order_id');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('order_items', (table) => {
    table.increments('id').primary();
    table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
    table.integer('product_id').unsigned().references('id').inTable('products').onDelete('SET NULL');
    table.integer('quantity').notNullable();
    table.decimal('unit_price', 10, 2).notNullable();
  });

  await knex.schema.createTable('payments', (table) => {
    table.increments('id').primary();
    table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
    table.string('razorpay_payment_id');
    table.decimal('amount', 10, 2).notNullable();
    table.enum('status', ['created', 'captured', 'failed']).defaultTo('created');
    table.timestamp('paid_at');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('cart_items', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
    table.integer('quantity').defaultTo(1);
    table.timestamps(true, true);
    table.unique(['user_id', 'product_id']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('cart_items');
  await knex.schema.dropTableIfExists('payments');
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('users');
};
