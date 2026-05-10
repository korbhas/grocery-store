exports.up = async function (knex) {
  await knex.schema.createTable('settings', (table) => {
    table.string('key').primary();
    table.text('value').notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex('settings').insert([
    { key: 'store_name', value: 'FreshMart' },
    { key: 'delivery_fee', value: '25' },
    { key: 'min_order_amount', value: '0' },
    { key: 'delivery_eta_min', value: '30' },
    { key: 'delivery_eta_max', value: '60' },
    { key: 'store_open', value: 'true' },
  ]);
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('settings');
};