const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const PackageController = require('../controllers/package-details');
const storage = require('../helpers/storageforProductDetails');

const router = express.Router();
router.get('/', PackageController.getPackageDetails);
router.get('/:id', PackageController.getPackageDetailsByPackageId);
router.post('/', storage, verifyToken, PackageController.postPackageDetails);
router.delete('/:id', verifyToken, PackageController.deletePackageDetails);
router.get('/singledata/:id', PackageController.getPackageDetailsById);
router.put('/update/:id', verifyToken, storage, PackageController.updatePackageDetails);



module.exports = router;
