const mongoose = require('mongoose');

const testimonialSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: false },
  isActive: { type: String, required: false },
  imagePath: { type: String, required: false },
  message: { type: String, required: false }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
