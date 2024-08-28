const mongoose = require('mongoose');

const ProductDetailsSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imagePath: { type: Array, required: true },

});

module.exports = mongoose.model('ProductDetails', ProductDetailsSchema);