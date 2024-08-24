const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imagePath: { type: String, required: false },
  isVideo: { type: String, required: false },
  videoPath: { type: String, required: false }
});

module.exports = mongoose.model('Banner', bannerSchema);
