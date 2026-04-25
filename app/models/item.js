const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String, required: true },
    grams: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
    rating: { type: Number, default: 4.0, min: 1, max: 5 },
    category: { type: String, default: 'meals' },
    isVeg: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
