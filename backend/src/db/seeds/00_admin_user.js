const bcrypt = require('bcrypt');

exports.seed = async function (knex) {
  const passwordHash = await bcrypt.hash('admin123', 10);

  await knex('users').insert({
    name: 'Admin',
    email: 'admin@freshmart.com',
    password_hash: passwordHash,
    phone: null,
    role: 'admin',
  }).onConflict('email').merge([
    'name', 'password_hash', 'role',
  ]);
};