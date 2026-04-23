const passport = require('passport');
const User = require('../../models/user');
const bcrypt = require('bcrypt');
const { sendOtp } = require('../../../utils/sendEmail');
const authController = () => {
  const _getRedirectUrl = (req) => {
    return req.user.role === 'admin' ? '/admin/orders' : '/customer/order';
  };

  return {
    login(req, res) {
      res.render('auth/login');
    },
    postLogin(req, res, next) {
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          req.flash('err', info.message);
          return next(err);
        }
        if (!user) {
          req.flash('err', info.message);
          return res.redirect('/login');
        }
        req.logIn(user, (err) => {
          if (err) {
            req.flash('err', info.message);
            return next(err);
          }

          return res.redirect(_getRedirectUrl(req));
        });
      })(req, res, next);
    },
    register(req, res) {
      res.render('auth/register');
    },
    async postRegister(req, res) {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        req.flash('err', 'All fields are required');
        req.flash('username', username);
        req.flash('email', email);
        return res.redirect('/register');
      }

      const existUser = await User.findOne({ email });
      if (existUser) {
        req.flash('err', 'Email already exists');
        req.flash('email', email);
        req.flash('username', username);
        return res.redirect('/register');
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedPass = await bcrypt.hash(password, 10);

      req.session.pendingUser = {
        username,
        email,
        password: hashedPass,
        otp,
        otpExpiry: Date.now() + 10 * 60 * 1000,
      };

      try {
        await sendOtp(email, otp);
      } catch (_) {
        req.flash('err', 'Failed to send OTP. Check your email config.');
        return res.redirect('/register');
      }

      return res.redirect('/verify-otp');
    },

    verifyOtp(req, res) {
      if (!req.session.pendingUser) return res.redirect('/register');
      res.render('auth/verify-otp', { email: req.session.pendingUser.email });
    },

    async postVerifyOtp(req, res) {
      const pending = req.session.pendingUser;
      if (!pending) return res.redirect('/register');

      if (Date.now() > pending.otpExpiry) {
        delete req.session.pendingUser;
        req.flash('err', 'OTP expired. Please register again.');
        return res.redirect('/register');
      }

      if (req.body.otp.trim() !== pending.otp) {
        req.flash('err', 'Incorrect OTP. Try again.');
        return res.redirect('/verify-otp');
      }

      try {
        const user = await User.create({
          username: pending.username,
          email: pending.email,
          password: pending.password,
        });
        delete req.session.pendingUser;
        req.logIn(user, (err) => {
          if (err) return res.redirect('/login');
          return res.redirect('/');
        });
      } catch (_) {
        req.flash('err', 'Something went wrong. Please try again.');
        return res.redirect('/register');
      }
    },
    logout(req, res) {
      req.logout((err) => {
        if (err) {
          console.error('Logging out error : ' + err);
          return res.redirect('/');
        }
        res.redirect('/login');
      });
    },
  };
};
module.exports = authController;
