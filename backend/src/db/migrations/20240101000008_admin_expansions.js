exports.up = async function (knex) {
  // Add is_banned to users if not already there
  const hasBanned = await knex.schema.hasColumn('users', 'is_banned');
  if (!hasBanned) {
    await knex.schema.alterTable('users', (table) => {
      table.boolean('is_banned').defaultTo(false);
    });
  }

  // Widen status column and (re)apply check constraint
  await knex.raw(`ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(20)`);
  await knex.raw(`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check`);
  await knex.raw(`
    ALTER TABLE orders
    ADD CONSTRAINT orders_status_check
    CHECK (status IN ('pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'))
  `);

  // delivery_agents
  const hasAgents = await knex.schema.hasTable('delivery_agents');
  if (!hasAgents) {
    await knex.schema.createTable('delivery_agents', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('phone').notNullable();
      table.string('vehicle_type').defaultTo('bike');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  const hasAgentCol = await knex.schema.hasColumn('orders', 'delivery_agent_id');
  if (!hasAgentCol) {
    await knex.schema.alterTable('orders', (table) => {
      table.integer('delivery_agent_id').nullable().references('id').inTable('delivery_agents').onDelete('SET NULL');
    });
  }

  // coupons
  const hasCoupons = await knex.schema.hasTable('coupons');
  if (!hasCoupons) {
    await knex.schema.createTable('coupons', (table) => {
      table.increments('id').primary();
      table.string('code').notNullable().unique();
      table.text('description').nullable();
      table.enum('discount_type', ['percentage', 'fixed']).notNullable();
      table.decimal('discount_value', 10, 2).notNullable();
      table.decimal('min_order_amount', 10, 2).defaultTo(0);
      table.integer('max_uses').nullable();
      table.integer('used_count').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table.timestamp('starts_at').nullable();
      table.timestamp('expires_at').nullable();
      table.timestamps(true, true);
    });
  }

  const hasCouponCol = await knex.schema.hasColumn('orders', 'coupon_id');
  if (!hasCouponCol) {
    await knex.schema.alterTable('orders', (table) => {
      table.integer('coupon_id').nullable().references('id').inTable('coupons').onDelete('SET NULL');
      table.decimal('discount_amount', 10, 2).defaultTo(0);
    });
  }

  // delivery_areas
  const hasAreas = await knex.schema.hasTable('delivery_areas');
  if (!hasAreas) {
    await knex.schema.createTable('delivery_areas', (table) => {
      table.increments('id').primary();
      table.string('pincode').notNullable().unique();
      table.string('area_name').notNullable();
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.alterTable('orders', (table) => {
    table.dropColumn('delivery_agent_id');
    table.dropColumn('coupon_id');
    table.dropColumn('discount_amount');
  });

  await knex.schema.dropTableIfExists('delivery_agents');
  await knex.schema.dropTableIfExists('coupons');
  await knex.schema.dropTableIfExists('delivery_areas');

  await knex.raw(`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check`);
  await knex.raw(`ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(20)`);

  const hasBanned = await knex.schema.hasColumn('users', 'is_banned');
  if (hasBanned) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('is_banned');
    });
  }
};
