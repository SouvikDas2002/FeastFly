const user = require('../../models/user');
async function admin(req, res, next) {
  try {
    const admin = await user.findOne({ _id: req.user._id });
    if (req.isAuthenticated() && admin && admin.role === 'admin') {
      return next();
    }
    return res.redirect('/');
  } catch (_) {
    return res.redirect('/');
  }
}
module.exports = admin;
