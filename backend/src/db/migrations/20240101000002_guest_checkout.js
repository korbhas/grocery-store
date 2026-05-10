exports.up = async function (knex) {
  await knex.schema.alterTable('orders', (table) => {
    table.integer('user_id').unsigned().nullable().alter();
    table.string('guest_name');
    table.string('guest_email');
    table.string('guest_phone');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('orders', (table) => {
    table.dropColumn('guest_name');
    table.dropColumn('guest_email');
    table.dropColumn('guest_phone');
  });
};