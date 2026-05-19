exports.up = async function (knex) {
  await knex.schema.createTable('product_variants', (t) => {
    t.increments('id').primary();
    t.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
    t.string('name').notNullable();
    t.decimal('price', 10, 2).notNullable();
    t.integer('stock_qty').defaultTo(0);
    t.boolean('is_default').defaultTo(false);
    t.integer('sort_order').defaultTo(0);
    t.timestamps(true, true);
  });

  await knex.schema.table('order_items', (t) => {
    t.integer('variant_id').unsigned().nullable().references('id').inTable('product_variants').onDelete('SET NULL');
    t.string('variant_name').nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.table('order_items', (t) => {
    t.dropColumn('variant_id');
    t.dropColumn('variant_name');
  });
  await knex.schema.dropTable('product_variants');
};
