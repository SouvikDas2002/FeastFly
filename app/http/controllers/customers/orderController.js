const Order = require('../../../models/order');
const moment = require('moment');
const { sendOrderConfirmation } = require('../../../../utils/sendEmail');

const orderController = () => {
  return {
    async store(req, res) {
      const { number, address } = req.body;

      if (!number || !address) {
        req.flash('err', 'All fields are required');
        return res.redirect('/cart');
      }

      const cart = req.session.cart;
      const totalAmount = Object.values(cart.items).reduce(
        (sum, { item, qty }) => sum + parseInt(item.price) * qty,
        0
      );
      const discountAmount = cart.coupon ? cart.coupon.discount : 0;
      const finalAmount = totalAmount - discountAmount;

      const order = new Order({
        customerId: req.user._id,
        items: cart.items,
        phone: number,
        address,
        totalAmount,
        discountAmount,
        finalAmount,
        couponCode: cart.coupon ? cart.coupon.code : undefined,
      });

      const confirmOrder = await order.save();
      if (confirmOrder) {
        const result = await Order.populate(confirmOrder, { path: 'customerId' });

        req.flash('success', 'Order placed successfully');
        delete req.session.cart;

        const eventEmitter = req.app.get('eventEmitter');
        eventEmitter.emit('orderPlaced', result);

        try {
          await sendOrderConfirmation(result.customerId.email, result);
        } catch (_) {}

        return res.redirect('/customer/order');
      }
      return res.redirect('/cart');
    },

    async index(req, res) {
      const limit = 5;
      const orders = await Order.find({ customerId: req.user._id }, null, {
        sort: { createdAt: -1 },
        limit,
      });
      const total = await Order.countDocuments({ customerId: req.user._id });
      res.render('customers/order', { orders, moment, total, limit });
    },

    async more(req, res) {
      const skip = parseInt(req.query.skip) || 0;
      const limit = 5;
      const orders = await Order.find({ customerId: req.user._id }, null, {
        sort: { createdAt: -1 },
        skip,
        limit,
      });
      const total = await Order.countDocuments({ customerId: req.user._id });
      return res.json({ orders, total, skip, limit });
    },

    async show(req, res) {
      const order = await Order.findById({ _id: req.params.id });
      try {
        if (req.user._id === order.customerId.toString()) {
          res.render('customers/singleOrder', { order, moment });
        } else {
          res.redirect('/');
        }
      } catch (_) {
        res.redirect('/login');
      }
    },
  };
};

module.exports = orderController;
