const crypto = require('crypto');

exports.up = async function (knex) {
  await knex.schema.alterTable('orders', (table) => {
    table.string('access_token').unique();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('orders', (table) => {
    table.dropColumn('access_token');
  });
};