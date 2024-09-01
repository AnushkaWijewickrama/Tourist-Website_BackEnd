const { Storage } = require('@google-cloud/storage');
const path = require('path');
const uuid = require('uuid').v4;
const Destination = require('../models/destination');

// Initialize Firebase Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, 'fir-78726-firebase-adminsdk-34sx9-1b52a3ed56.json'), // Update with your actual path
  projectId: 'fir-78726', // Replace with your actual project ID
});
const bucket = storage.bucket('gs://fir-78726.appspot.com');

exports.getDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find();
    res.status(200).json(destinations);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getDestination = async (req, res) => {
  const { id } = req.params
  const destination = await Destination.findOne({ _id: id });
  res.status(200).json(destination);
};

exports.postDestination = async (req, res) => {
  const { title, description, latest, price, discount, location } = req.body;
  let imagePath = '';

  if (req.file) {
    try {
      // Define the file name with a unique identifier
      const blob = bucket.file(`destination/${uuid()}_${req.file.originalname}`);
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

        // Create the Destination object and save it to the database
        const destination = new Destination({
          title,
          description,
          imagePath,
          latest,
          price,
          discount,
          location
        });

        const createdDestination = await destination.save();

        res.status(201).json({
          Destination: {
            ...createdDestination._doc,
          },
        });
      });

      blobStream.end(req.file.buffer);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Uploading image failed.' });
    }
  } else {
    // Handle case where no image is provided
    res.status(400).json({ message: 'No image provided.' });
  }
};
exports.deleteDestinationById = async (req, res) => {
  const { id } = req.params;
  await Destination.deleteMany({ _id: id });
  res.status(201).json(await Destination.find());;

};
exports.postDestinationSingle = async (req, res) => {
  const { title, description, latest, price, discount, location } = req.body;
  let imagePath = '';

  if (req.file) {
    try {
      // Define the file name with a unique identifier
      const blob = bucket.file(`destination/${uuid()}_${req.file.originalname}`);
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

        // Create the Destination object and save it to the database
        const destination = new Destination({
          title,
          description,
          imagePath,
          latest,
          price,
          discount,
          location

        });

        const createdDestination = await destination.save();

        res.status(201).json({
          Destination: {
            ...createdDestination._doc,
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
exports.updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, latest, discount, location } = req.body;

    let imagePath;
    if (req.file) {
      try {
        // Upload the new image to Firebase Cloud Storage
        const blob = bucket.file(`destination/${uuid()}_${req.file.originalname}`);
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
          return res.status(500).json({ message: 'Failed to upload image to Firebase Cloud Storage.' });
        });

        blobStream.on('finish', async () => {
          // Make the file public
          await blob.makePublic();

          // Get the public URL of the file
          imagePath = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

          // Perform the update after the image has been uploaded
          const updates = {
            ...(title && { title }),
            ...(description && { description }),
            ...(imagePath && { imagePath }),
            ...(price && { price }),
            ...(latest && { latest }),
            ...(discount && { discount }),
            ...(location && { location }),
          };

          const updatedDestination = await Destination.findByIdAndUpdate(id, updates, { new: true });

          if (!updatedDestination) {
            return res.status(404).json({ error: "Destination not found" });
          }

          res.status(200).json(updatedDestination);
        });

        blobStream.end(req.file.buffer);

      } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).json({ message: 'Image processing failed.' });
      }
    } else {
      // If no new image, proceed with updating other fields
      const updates = {
        ...(title && { title }),
        ...(description && { description }),
        ...(price && { price }),
        ...(latest && { latest }),
        ...(discount && { discount }),
        ...(location && { location }),
      };

      const updatedDestination = await Destination.findByIdAndUpdate(id, updates, { new: true });

      if (!updatedDestination) {
        return res.status(404).json({ error: "Destination not found" });
      }

      res.status(200).json(updatedDestination);
    }
  } catch (error) {
    console.error("Error in updateDestination:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getDestinationById = async (req, res) => {
  const destination = await Destination.findOne({ _id: req?.params?.id });
  res.status(200).json(destination);
};