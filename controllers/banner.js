const { Storage } = require('@google-cloud/storage');
const path = require('path');
const uuid = require('uuid').v4;
const Banner = require('../models/banner');

// Initialize Firebase Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, 'fir-78726-firebase-adminsdk-34sx9-1b52a3ed56.json'), // Update with your actual path
  projectId: 'fir-78726', // Replace with your actual project ID
});
const bucket = storage.bucket('gs://fir-78726.appspot.com');
exports.getBanners = async (req, res) => {
  const banners = await Banner.find();
  res.status(200).json(banners);
};

exports.postBanner = async (req, res) => {
  const { title, description, isVideo, videoPath } = req.body;
  let imagePath = '';

  if (isVideo != true) {
    if (req.file) {
      try {
        const blob = bucket.file(`banner/${uuid()}_${req.file.originalname}`);
        const blobStream = blob.createWriteStream({
          resumable: false,
          contentType: req.file.mimetype,
          metadata: {
            metadata: {
              firebaseStorageDownloadTokens: uuid(),
            },
          },
        });

        blobStream.on('error', (err) => {
          console.error(err);
          res.status(500).json({ message: 'Failed to upload image to Firebase Cloud Storage.' });
          return;
        });

        blobStream.on('finish', async () => {
          // Make the file public
          await blob.makePublic();

          // Get the public URL of the file
          imagePath = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

          // Create the Banner object and save it to the database
          const banner = new Banner({
            title,
            description,
            imagePath,
            isVideo,
            videoPath
          });

          const createdBanner = await banner.save();

          res.status(201).json({
            profile: {
              ...createdBanner._doc,
            },
          });
        });

        blobStream.end(req.file.buffer);

      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Uploading image failed.' });
      }
    }
  } else {
    try {
      // If it's a video banner, just save without an imagePath
      const banner = new Banner({
        title,
        description,
        isVideo,
        videoPath
      });

      const createdBanner = await banner.save();

      res.status(201).json({
        profile: {
          ...createdBanner._doc,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Creating banner failed.' });
    }
  }
};

exports.deleteBanner = async (req, res) => {
  const { id } = req.params;
  await Banner.deleteMany({ _id: id });
  res.status(201).json(await Banner.find());;

};