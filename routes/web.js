const homeController = require('../app/http/controllers/homeController');
const authController = require('../app/http/controllers/authController');
const cartController = require('../app/http/controllers/customers/cartController');
const couponController = require('../app/http/controllers/customers/couponController');
const orderController = require('../app/http/controllers/customers/orderController');
const paymentController = require('../app/http/controllers/customers/paymentController');
const profileController = require('../app/http/controllers/customers/profileController');
const adminController = require('../app/http/controllers/admin/orderController');
const itemController = require('../app/http/controllers/admin/itemController');
const guest = require('../app/http/middlewares/guest');
const auth = require('../app/http/middlewares/auth');
const admin = require('../app/http/middlewares/admin');
const passport = require('passport');

const routeGateWay = (app) => {
  app.get('/', homeController().index);
  app.get('/offers', homeController().offers);

  app.get('/login', guest, authController().login);
  app.post('/login', authController().postLogin);

  app.get('/register', guest, authController().register);
  app.post('/register', authController().postRegister);

  app.get('/verify-otp', authController().verifyOtp);
  app.post('/verify-otp', authController().postVerifyOtp);

  app.get('/auth/google', guest, passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect(req.user.role === 'admin' ? '/admin/orders' : '/customer/order');
    }
  );

  app.get('/cart', cartController().cart);
  app.post('/update-cart', cartController().update);
  app.post('/remove-from-cart', cartController().remove);

  app.post('/logout', authController().logout);

  app.post('/apply-coupon', auth, couponController().apply);
  app.post('/remove-coupon', auth, couponController().remove);

  app.post('/orders', auth, orderController().store);
  app.get('/customer/order', auth, orderController().index);
  app.get('/customer/orders/more', auth, orderController().more);
  app.get('/customer/order/:id', auth, orderController().show);

  // Payment routes
  app.post('/payment/create-order', auth, paymentController().createOrder);
  app.post('/payment/verify', auth, paymentController().verify);

  // Profile & saved addresses
  app.get('/customer/profile', auth, profileController().index);
  app.post('/customer/addresses', auth, profileController().addAddress);
  app.post('/customer/addresses/delete', auth, profileController().deleteAddress);

  // Admin routes
  app.get('/admin/orders', admin, adminController().index);
  app.post('/admin/orders/status', admin, adminController().status);

  app.get('/admin/items', admin, itemController().index);
  app.post('/admin/items', admin, itemController().store);
  app.post('/admin/items/delete', admin, itemController().destroy);
};

module.exports = routeGateWay;
