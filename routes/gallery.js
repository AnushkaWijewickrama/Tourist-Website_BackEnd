const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const galleryController = require('../controllers/gallery');

const storage = require('../helpers/storageforGallery');

const router = express.Router();
router.get('/', galleryController.getgallery);
router.post('/', verifyToken, storage, galleryController.postgallery);
router.delete('/:id', verifyToken, galleryController.deletegallery);



module.exports = router;
