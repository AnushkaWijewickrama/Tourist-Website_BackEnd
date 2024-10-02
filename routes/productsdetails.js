const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const productController = require('../controllers/products-details');
const storage = require('../helpers/storageforProductDetails');

const router = express.Router();
router.get('/', productController.getProductDetails);
router.get('/:id', productController.getProductDetailsByProductId);
router.post('/', storage, verifyToken, productController.postProductDetails);
router.delete('/:id', verifyToken, productController.deleteProductDetails);
router.get('/singledata/:id', productController.getProductDetailsById);
router.put('/update/:id', verifyToken, storage, productController.updateProductDetails);



module.exports = router;
