const Razorpay = require('razorpay');
const crypto = require('crypto');
const Item = require('../../../models/item');
const Order = require('../../../models/order');
const { sendOrderConfirmation } = require('../../../../utils/sendEmail');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentController = () => {
  return {
    async createOrder(req, res) {
      if (!req.session.cart) return res.status(400).json({ error: 'Cart is empty' });

      const cart = req.session.cart;
      const itemIds = Object.keys(cart.items);
      const dbItems = await Item.find({ _id: { $in: itemIds } });

      const priceMap = {};
      dbItems.forEach((i) => {
        priceMap[i._id.toString()] = i.price;
      });

      let totalAmount = 0;
      itemIds.forEach((id) => {
        const entry = cart.items[id];
        const price = priceMap[id] !== undefined ? priceMap[id] : parseInt(entry.item.price);
        totalAmount += price * entry.qty;
      });

      const razorpayOrder = await razorpay.orders.create({
        amount: totalAmount * 100,
        currency: 'INR',
        receipt: `ff_${Date.now()}`,
      });

      req.session.pendingPayment = { razorpayOrderId: razorpayOrder.id, totalAmount };

      return res.json({
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID,
      });
    },

    async verify(req, res) {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, phone, address } =
        req.body;

      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = hmac.digest('hex');

      if (digest !== razorpay_signature) {
        return res.status(400).json({ error: 'Payment verification failed' });
      }

      const pending = req.session.pendingPayment || {};
      const order = new Order({
        customerId: req.user._id,
        items: req.session.cart.items,
        phone,
        address,
        totalAmount: pending.totalAmount,
        paymentType: 'online',
        paymentStatus: 'paid',
        paymentOrderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        paymentSignature: razorpay_signature,
      });

      const saved = await order.save();
      const result = await Order.populate(saved, { path: 'customerId' });

      delete req.session.cart;
      delete req.session.pendingPayment;

      const eventEmitter = req.app.get('eventEmitter');
      eventEmitter.emit('orderPlaced', result);

      try {
        await sendOrderConfirmation(result.customerId.email, result);
      } catch (_) {}

      return res.json({ success: true, orderId: saved._id });
    },
  };
};

module.exports = paymentController;
