const { Storage } = require('@google-cloud/storage');
const path = require('path');
const uuid = require('uuid').v4;
const Package = require('../models/package');

// Initialize Firebase Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, 'fir-78726-firebase-adminsdk-34sx9-1b52a3ed56.json'), // Update with your actual path
  projectId: 'fir-78726', // Replace with your actual project ID
});
const bucket = storage.bucket('gs://fir-78726.appspot.com');

exports.getpackages = async (req, res) => {
  try {
    const packages = await Package.find().select('price imagePath title description latest discount');
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getpackage = async (req, res) => {
  const { id } = req.params
  const package = await Package.findOne({ _id: id });
  res.status(200).json(package);
};

exports.postpackage = async (req, res) => {
  const { title, description, latest, price, discount } = req.body;
  let imagePath = '';

  if (req.file) {
    try {
      // Define the file name with a unique identifier
      const blob = bucket.file(`packages/${uuid()}_${req.file.originalname}`);
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

        // Create the Package object and save it to the database
        const package = new Package({
          title,
          description,
          imagePath,
          latest,
          price,
          discount
        });

        const createdPackage = await package.save();

        res.status(201).json({
          package: {
            ...createdPackage._doc,
          },
        });
      });

      blobStream.end(req.file.buffer);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Uploading image failed.' });
    }
  } else {
    res.status(400).json({ message: 'No image provided.' });
  }
};
exports.deletepackageById = async (req, res) => {
  const { id } = req.params;
  await Package.deleteMany({ _id: id });
  res.status(201).json(await Package.find());;

};
exports.postpackageSingle = async (req, res) => {
  const { title, description, latest, price, discount } = req.body;
  let imagePath = '';

  if (req.file) {
    try {
      // Define the file name with a unique identifier
      const blob = bucket.file(`packages/${uuid()}_${req.file.originalname}`);
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

        // Create the Package object and save it to the database
        const package = new Package({
          title,
          description,
          imagePath,
          latest,
          price,
          discount
        });

        const createdPackage = await package.save();

        res.status(201).json({
          package: {
            ...createdPackage._doc,
          },
        });
      });

      blobStream.end(req.file.buffer);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Uploading image failed.' });
    }
  } else {
    res.status(400).json({ message: 'No image provided.' });
  }
};
exports.updatepackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, latest, discount } = req.body;

    const updates = {};

    if (req.file) {
      try {
        // Define the file name with a unique identifier
        const blob = bucket.file(`packages/${uuid()}_${req.file.originalname}`);
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
          console.error("Error uploading image to Firebase:", err);
          res.status(500).json({ message: 'Failed to upload image to Firebase Cloud Storage.' });
          return;
        });

        blobStream.on('finish', async () => {
          // Make the file public
          await blob.makePublic();

          // Get the public URL of the file
          const imagePath = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

          // Add imagePath to updates
          updates['imagePath'] = imagePath;

          // Perform the update after the image has been uploaded
          const updatedPackage = await Package.findByIdAndUpdate(id, updates, { new: true });

          if (!updatedPackage) {
            return res.status(404).json({ error: "Package not found" });
          }

          res.status(200).json(updatedPackage);
        });

        blobStream.end(req.file.buffer);

      } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).json({ message: 'Image processing failed.' });
      }
    } else {
      // If no new image, proceed with updating other fields
      if (title) updates['title'] = title;
      if (description) updates['description'] = description;
      if (price) updates['price'] = price;
      if (latest) updates['latest'] = latest;
      if (discount) updates['discount'] = discount;

      const updatedPackage = await Package.findByIdAndUpdate(id, updates, { new: true });

      if (!updatedPackage) {
        return res.status(404).json({ error: "Package not found" });
      }

      res.status(200).json(updatedPackage);
    }
  } catch (error) {
    console.error("Error in updatepackage:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getpackageById = async (req, res) => {
  const package = await Package.findOne({ _id: req?.params?.id });
  res.status(200).json(package);
};