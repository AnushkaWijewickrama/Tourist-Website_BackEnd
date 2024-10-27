const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const testimonialController = require('../controllers/testimonial');

const upload = require('../helpers/storage');

const router = express.Router();

router.get('/', verifyToken, testimonialController.getTestimonials);
router.get('/public', testimonialController.getTestimonialsPublic);
router.get('/singledata/:id', verifyToken, testimonialController.getTestimonialById);
router.post('/', testimonialController.postTestimonialPublic);
router.post('/', verifyToken, testimonialController.postTestimonial);
router.put('/update/:id', verifyToken, upload, testimonialController.updateTestimonial);
router.delete('/:id', verifyToken, testimonialController.deleteTestimonial);

module.exports = router;
