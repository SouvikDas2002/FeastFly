/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('../app/models/item');
const items = require('../items.json');

async function seed() {
  await mongoose.connect(process.env.MONGO_URL);
  await Item.deleteMany();
  await Item.insertMany(
    items.map(({ name, image, price, size }) => ({ name, image, price, size }))
  );
  console.log(`Seeded ${items.length} items`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
