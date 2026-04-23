const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: Object, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    totalAmount: { type: Number },
    paymentType: { type: String, default: 'COD' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentOrderId: { type: String },
    paymentId: { type: String },
    paymentSignature: { type: String },
    status: { type: String, default: 'order_placed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
