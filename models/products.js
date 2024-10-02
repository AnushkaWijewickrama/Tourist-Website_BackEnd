const mongoose = require('mongoose');


const productSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imagePath: { type: String, required: true },
  price: { type: String, required: false },
  latest: { type: String, required: true },
  productDetails: { type: String, required: false },
  priceActive: { type: String, required: false }

});

module.exports = mongoose.model('Product', productSchema);
