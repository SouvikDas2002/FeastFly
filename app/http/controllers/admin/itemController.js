const Item = require('../../../models/item');

const itemController = () => {
  return {
    async index(req, res) {
      const items = await Item.find();
      const success = req.flash('success');
      const err = req.flash('err');
      res.render('admin/items', { items, success, err });
    },

    async store(req, res) {
      const { name, price, size, image } = req.body;
      if (!name || !price || !size || !image) {
        req.flash('err', 'All fields are required');
        return res.redirect('/admin/items');
      }
      await Item.create({
        name,
        price: Number(price),
        size,
        image,
        category: req.body.category || 'other',
        isVeg: req.body.isVeg === 'on',
        isPopular: req.body.isPopular === 'on',
        isAvailable: req.body.isAvailable === 'on',
      });
      req.flash('success', 'Item added successfully');
      return res.redirect('/admin/items');
    },

    async destroy(req, res) {
      await Item.deleteOne({ _id: req.body.itemId });
      return res.redirect('/admin/items');
    },
  };
};

module.exports = itemController;
