exports.seed = async function (knex) {
  await knex('delivery_areas')
    .insert({ pincode: '784028', area_name: 'Tezpur', is_active: true })
    .onConflict('pincode')
    .ignore();
};
