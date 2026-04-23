const Order = require('../../../models/order');
const { sendOrderStatusUpdate } = require('../../../../utils/sendEmail');

const orderController = () => {
  return {
    async index(req, res) {
      const orders = await Order.find({ status: { $ne: 'completed' } }, null, {
        sort: { createdAt: -1 },
      })
        .populate('customerId', '-password')
        .exec();
      if (req.xhr) {
        return res.json(orders);
      }
      return res.render('admin/orders.ejs');
    },

    async status(req, res) {
      try {
        const updated = await Order.findByIdAndUpdate(
          req.body.orderId,
          { status: req.body.status },
          { new: true }
        ).populate('customerId', 'email username');

        const eventEmitter = req.app.get('eventEmitter');
        eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status });

        if (updated && updated.customerId && updated.customerId.email) {
          try {
            await sendOrderStatusUpdate(updated.customerId.email, updated, req.body.status);
          } catch (_) {}
        }

        return res.redirect('/admin/orders');
      } catch (_) {
        return res.redirect('/admin/orders');
      }
    },
  };
};

module.exports = orderController;
