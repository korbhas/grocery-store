exports.up = async function (knex) {
  await knex.schema.alterTable('categories', (table) => {
    table.integer('sort_order').defaultTo(0);
  });

  const categories = await knex('categories').orderBy('id');
  for (let i = 0; i < categories.length; i++) {
    await knex('categories').where({ id: categories[i].id }).update({ sort_order: i });
  }
};

exports.down = async function (knex) {
  await knex.schema.alterTable('categories', (table) => {
    table.dropColumn('sort_order');
  });
};