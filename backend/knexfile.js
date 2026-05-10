if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: '.env.test' });
} else {
  require('dotenv').config();
}

function parseConnectionUrl(url) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: parseInt(u.port) || 5432,
    database: u.pathname.slice(1),
    user: u.username,
    password: decodeURIComponent(u.password),
    // force IPv4 — Supabase resolves to IPv6 only on some systems
    family: 4,
    ssl: { rejectUnauthorized: false },
  };
}

const devConnectionUrl = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
const testConnection = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/grocery_store_test';

module.exports = {
  development: {
    client: 'pg',
    connection: parseConnectionUrl(devConnectionUrl),
    migrations: { directory: './src/db/migrations' },
    seeds: { directory: './src/db/seeds' },
  },
  test: {
    client: 'pg',
    connection: testConnection,
    migrations: { directory: './src/db/migrations' },
    seeds: { directory: './src/db/seeds' },
  },
};
