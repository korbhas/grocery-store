exports.up = async function (knex) {
  await knex.schema.alterTable('orders', (table) => {
    table.timestamp('estimated_delivery').nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('orders', (table) => {
    table.dropColumn('estimated_delivery');
  });
};