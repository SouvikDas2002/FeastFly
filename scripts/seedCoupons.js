require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('../app/models/coupon');

const coupons = [
  {
    code: 'FIRST50',
    type: 'percentage',
    value: 50,
    maxDiscount: 100,
    condition: 'firstOrder',
    minOrder: 0,
  },
  { code: 'FEAST60', type: 'flat', value: 60, minOrder: 299, condition: 'none' },
  { code: 'BOGOFEAST', type: 'percentage', value: 33, minOrder: 0, condition: 'none' },
  { code: 'FREEDEL', type: 'flat', value: 30, minOrder: 199, condition: 'none' },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URL);
  for (const c of coupons) {
    await Coupon.updateOne({ code: c.code }, { $set: c }, { upsert: true });
    console.log(`Seeded: ${c.code}`);
  }
  await mongoose.disconnect();
  console.log('Done.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
