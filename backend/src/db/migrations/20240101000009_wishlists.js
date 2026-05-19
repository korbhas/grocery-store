exports.up = function (knex) {
  return knex.schema.createTable('wishlists', (t) => {
    t.increments('id').primary();
    t.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.unique(['user_id', 'product_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('wishlists');
};
