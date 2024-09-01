const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid').v4;

// Initialize Firebase Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, 'fir-78726-firebase-adminsdk-34sx9-1b52a3ed56.json'), // Update with your actual path
  projectId: 'fir-78726', // Replace with your actual project ID
});

const bucket = storage.bucket('gs://fir-78726.appspot.com'); // Replace with your actual bucket name

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
};

const multerStorage = multer.memoryStorage(); // Temporarily store files in memory

const upload = multer({ storage: multerStorage, fileFilter: fileFilter }).single('image');

const uploadToFirebase = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject('No file provided');
    }

    const blob = bucket.file(`asset/packages/${uuid()}_${file.originalname}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: uuid(),
        },
      },
    });

    blobStream.on('error', (err) => {
      reject(err);
    });

    blobStream.on('finish', () => {
      // Get the public URL of the uploaded file
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

module.exports = upload;


