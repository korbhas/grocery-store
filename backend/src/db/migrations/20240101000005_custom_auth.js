exports.up = async function (knex) {
  await knex.schema.alterTable('users', (table) => {
    table.string('clerk_id').nullable().alter();
    table.string('password_hash').nullable();
    table.boolean('email_verified').defaultTo(false);
  });

  await knex.schema.alterTable('users', (table) => {
    table.unique('email');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('password_hash');
    table.dropColumn('email_verified');
    table.dropUnique('email');
  });
};