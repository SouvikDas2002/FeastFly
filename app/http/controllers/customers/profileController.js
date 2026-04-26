const User = require('../../../models/user');

const profileController = () => {
  return {
    async index(req, res) {
      const userId = req.user._id;
      const profileUser = await User.findById(userId).select(
        'username email addresses referralCode credits'
      );

      if (!profileUser.referralCode) {
        const code = 'FF' + profileUser._id.toString().slice(-6).toUpperCase();
        await User.findByIdAndUpdate(userId, { referralCode: code });
        profileUser.referralCode = code;
      }

      res.render('customers/profile', { profileUser });
    },

    async addAddress(req, res) {
      const { label, address } = req.body;
      if (!label || !address) {
        req.flash('err', 'Label and address are required');
        return res.redirect('/customer/profile');
      }
      const userId = req.user._id;
      await User.findByIdAndUpdate(userId, {
        $push: { addresses: { label, address } },
      });
      req.flash('success', 'Address saved');
      return res.redirect('/customer/profile');
    },

    async deleteAddress(req, res) {
      const { addressId } = req.body;
      const userId = req.user._id;
      await User.findByIdAndUpdate(userId, {
        $pull: { addresses: { _id: addressId } },
      });
      return res.redirect('/customer/profile');
    },
  };
};

module.exports = profileController;
