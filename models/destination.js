const mongoose = require('mongoose');


const destinationSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imagePath: { type: String, required: true },
  price: { type: String, required: true },
  latest: { type: String, required: false },
  discount: { type: String, required: false },
  location: { type: String, required: false }

});

module.exports = mongoose.model('Destination', destinationSchema);
