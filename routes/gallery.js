const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const galleryController = require('../controllers/gallery');

const upload = require('../helpers/storageforGallery');

const router = express.Router();
router.get('/', galleryController.getgallery);
router.post('/', verifyToken, upload, galleryController.postgallery);
router.delete('/:id', verifyToken, galleryController.deletegallery);



module.exports = router;
