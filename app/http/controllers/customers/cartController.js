const User = require('../../../models/user');

const cartController = () => {
  return {
    async cart(req, res) {
      let addresses = [];
      if (req.isAuthenticated && req.isAuthenticated()) {
        try {
          const userId = req.user._id;
          const user = await User.findById(userId).select('addresses');
          addresses = user && user.addresses ? user.addresses : [];
        } catch (_) {}
      }
      res.render('customers/cart', { addresses });
    },

    update(req, res) {
      if (!req.session.cart) {
        req.session.cart = { items: {}, totalQty: 0, totalPrice: 0 };
      }
      const cart = req.session.cart;
      const { _id, price, type } = req.body;

      if (type === 'decrement') {
        if (cart.items[_id]) {
          cart.items[_id].qty -= 1;
          cart.totalQty -= 1;
          cart.totalPrice -= parseInt(price);
          if (cart.items[_id].qty <= 0) {
            delete cart.items[_id];
          }
        }
      } else {
        if (!cart.items[_id]) {
          cart.items[_id] = { item: req.body, qty: 1 };
        } else {
          cart.items[_id].qty += 1;
        }
        cart.totalQty += 1;
        cart.totalPrice += parseInt(price);
      }

      delete cart.coupon;
      return res.json({ totalQty: req.session.cart.totalQty });
    },

    remove(req, res) {
      if (!req.session.cart) return res.json({ totalQty: 0 });
      const cart = req.session.cart;
      const { _id } = req.body;
      if (cart.items[_id]) {
        const entry = cart.items[_id];
        cart.totalQty -= entry.qty;
        cart.totalPrice -= entry.qty * parseInt(entry.item.price);
        delete cart.items[_id];
      }
      if (Object.keys(cart.items).length === 0) {
        delete req.session.cart;
      } else {
        delete cart.coupon;
      }
      return res.json({ totalQty: req.session.cart ? req.session.cart.totalQty : 0 });
    },
  };
};

module.exports = cartController;
