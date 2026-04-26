const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    role: { type: String, default: 'customer' },
    addresses: [
      {
        label: { type: String, required: true },
        address: { type: String, required: true },
      },
    ],
    referralCode: { type: String },
    credits: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
