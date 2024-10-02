const express = require('express');
const verifyToken = require('../middleware/authMiddleware');

const productController = require('../controllers/products');

const storage = require('../helpers/storage');

const router = express.Router();

router.get('/', productController.getProducts);
router.post('/', verifyToken, storage, productController.postProduct);
router.post('/product-single/', verifyToken, productController.postProductSingle);
router.delete('/:id', verifyToken, productController.deleteProductById);
router.get('/:id', productController.getProduct);
router.get('/singledata/:id', verifyToken, productController.getProductById);
router.put('/update/:id', verifyToken, storage, productController.updateProduct);

module.exports = router;
