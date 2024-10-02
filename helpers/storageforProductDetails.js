const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid').v4;

// Initialize Firebase Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, 'fir-78726-firebase-adminsdk-34sx9-1b52a3ed56.json'), // Update with your actual path
  projectId: 'fir-78726', // Replace with your actual project ID
});


const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
};

const multerStorage = multer.memoryStorage(); // Temporarily store files in memory
const upload = multer({ storage: multerStorage, fileFilter: fileFilter }).fields([
  { name: 'image', maxCount: 20 }
]);
module.exports = upload;