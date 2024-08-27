const express = require('express');
const verifyToken = require('../middleware/authMiddleware');

const destinationController = require('../controllers/destination');

const storage = require('../helpers/storagefordestination');

const router = express.Router();

router.get('/', destinationController.getDestinations);
router.post('/', verifyToken, storage, destinationController.postDestination);
router.post('/destination-single/', verifyToken, destinationController.postDestinationSingle);
router.delete('/:id', verifyToken, destinationController.deleteDestinationById);
router.get('/:id', destinationController.getDestination);
router.get('/singledata/:id', verifyToken, destinationController.getDestinationById);
router.put('/update/:id', verifyToken, storage, destinationController.updateDestination);

module.exports = router;
