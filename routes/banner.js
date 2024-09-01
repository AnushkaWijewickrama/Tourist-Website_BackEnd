const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const bannerController = require('../controllers/banner');

const upload = require('../helpers/storage');

const router = express.Router();

router.get('/', bannerController.getBanners);

router.post('/', upload, verifyToken, bannerController.postBanner);
router.delete('/:id', verifyToken, bannerController.deleteBanner);

module.exports = router;
