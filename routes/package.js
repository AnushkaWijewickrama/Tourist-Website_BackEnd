const express = require('express');
const verifyToken = require('../middleware/authMiddleware');

const packageController = require('../controllers/package');

const storage = require('../helpers/storageforpackage');
// const storageforMulti = require('../helpers/storageforpackagedetails');

const router = express.Router();

router.get('/', packageController.getpackages);
router.post('/', verifyToken, storage, packageController.postpackage);
router.post('/package-single/', verifyToken, packageController.postpackageSingle);
router.delete('/:id', verifyToken, packageController.deletepackageById);
router.get('/:id', packageController.getpackage);
router.get('/singledata/:id', verifyToken, packageController.getpackageById);
router.put('/update/:id', verifyToken, storage, packageController.updatepackage);

module.exports = router;
