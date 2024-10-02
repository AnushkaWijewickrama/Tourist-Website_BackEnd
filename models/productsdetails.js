const mongoose = require('mongoose');

const ProductDetailsSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  longDescription: { type: String, required: false },
  imagePath: { type: Array, required: true }

});

module.exports = mongoose.model('ProductSingle', ProductDetailsSchema);