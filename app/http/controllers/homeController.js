const Item = require('../../models/item');
const homeController = () => {
  return {
    async index(req, res) {
      const items = await Item.find();
      res.render('home', { allItems: items });
    },
    async offers(req, res) {
      const popularItems = await Item.find({ isPopular: true, isAvailable: true });
      res.render('offers', { popularItems });
    },
  };
};
module.exports = homeController;
