const Coupon = require('../../../models/coupon');
const Order = require('../../../models/order');

const couponController = () => {
  return {
    async apply(req, res) {
      const { code } = req.body;
      const cart = req.session.cart;

      if (!cart || !Object.keys(cart.items || {}).length) {
        return res.json({ error: 'Your cart is empty' });
      }

      const coupon = await Coupon.findOne({
        code: (code || '').trim().toUpperCase(),
        isActive: true,
      });
      if (!coupon) return res.json({ error: 'Invalid or expired coupon code' });

      if (cart.totalPrice < coupon.minOrder) {
        return res.json({ error: `Minimum order of ₹${coupon.minOrder} required for this coupon` });
      }

      if (coupon.condition === 'firstOrder') {
        const existing = await Order.countDocuments({ customerId: req.user._id });
        if (existing > 0)
          return res.json({ error: 'This coupon is valid for your first order only' });
      }

      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = Math.floor((cart.totalPrice * coupon.value) / 100);
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      } else {
        discount = coupon.value;
      }
      discount = Math.min(discount, cart.totalPrice);

      req.session.cart.coupon = {
        code: coupon.code,
        discount,
        finalTotal: cart.totalPrice - discount,
      };

      return res.json({
        success: true,
        code: coupon.code,
        discount,
        finalTotal: cart.totalPrice - discount,
      });
    },

    remove(req, res) {
      if (req.session.cart) delete req.session.cart.coupon;
      return res.json({ success: true });
    },
  };
};

module.exports = couponController;
