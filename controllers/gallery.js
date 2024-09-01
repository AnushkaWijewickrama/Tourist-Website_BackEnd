const { Storage } = require('@google-cloud/storage');
const path = require('path');
const uuid = require('uuid').v4;
const galleryDetails = require('../models/gallery');

// Initialize Firebase Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, 'fir-78726-firebase-adminsdk-34sx9-1b52a3ed56.json'), // Update with your actual path
  projectId: 'fir-78726', // Replace with your actual project ID
});
const bucket = storage.bucket('gs://fir-78726.appspot.com');
exports.getgallery = async (req, res) => {
  const gallerys = await galleryDetails.find();
  res.status(200).json(gallerys);
};

exports.postgallery = async (req, res) => {
  const { title, description } = req.body;
  const imageData = req?.files?.image;
  const imagePath = [];

  if (Array.isArray(imageData)) {
    try {
      const uploadPromises = imageData.map(async (element) => {
        return new Promise((resolve, reject) => {
          // Define the file name with a unique identifier
          const blob = bucket.file(`gallery/${uuid()}_${element.originalname}`);
          const blobStream = blob.createWriteStream({
            resumable: false,
            contentType: element.mimetype,
            metadata: {
              metadata: {
                firebaseStorageDownloadTokens: uuid(),
              },
            },
          });

          blobStream.on('error', (err) => {
            console.error("Error uploading image to Firebase:", err);
            reject(err);
          });

          blobStream.on('finish', async () => {
            // Make the file public
            await blob.makePublic();

            // Get the public URL of the file
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            imagePath.push(publicUrl);
            resolve();
          });

          blobStream.end(element.buffer);
        });
      });

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      // Create and save the gallery entry
      const gallery = new galleryDetails({
        title,
        description,
        imagePath
      });

      const createdGallery = await gallery.save();
      res.status(201).json({
        gallery: {
          ...createdGallery._doc,
        },
      });

    } catch (error) {
      console.error("Error processing images:", error);
      res.status(500).json({ message: 'Image processing failed.' });
    }
  } else {
    res.status(400).json({ message: 'No images provided.' });
  }
};
exports.deletegallery = async (req, res) => {
  const { id } = req.params;
  await galleryDetails.deleteMany({ _id: id });
  res.status(201).json(await galleryDetails.find());;

};
exports.updategallery = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, longDescription } = req.body;

    // Array to hold new image URLs
    let newImages = [];

    // Check if the request contains images
    if (req.files && req.files.image) {
      // If multiple images, iterate and push URLs to newImages array
      if (Array.isArray(req.files.image)) {
        newImages = req.files.image.map(file => process.env.PROTOCOL + '://' + req.get('host') + '/gallery-details/' + file.filename);
      } else {
        // If single image, push its URL to newImages array
        newImages.push(process.env.PROTOCOL + '://' + req.get('host') + '/gallery-details/' + req.files.image[0].filename);
      }
    }

    // Check if a PDF file is uploaded
    let pdf;
    if (req.files && req.files.pdf) {
      pdf = process.env.PROTOCOL + '://' + req.get('host') + '/gallery-details/' + req.files.pdf[0].filename;
    }

    // Find the gallery details by ID
    const galleryDetails = await galleryDetails.findById(id);

    // If gallery not found, return 404
    if (!galleryDetails) {
      return res.status(404).json({ error: "gallery not found" });
    }

    // Check if there are updated images
    const updatedImages = galleryDetails.imagePath.filter(data => req.body?.image?.includes(data));

    // Combine updated and new images
    const finalImages = updatedImages.concat(newImages);

    // Update fields
    const updates = {};
    if (title) updates['title'] = title;
    if (description) updates['description'] = description;
    if (pdf) updates['pdf'] = pdf;
    if (longDescription) updates['longDescription'] = longDescription;
    updates['imagePath'] = finalImages;

    // Update gallery details
    const updatedgalleryDetails = await galleryDetails.findByIdAndUpdate(id, updates, { new: true });

    // Send updated gallery details in the response
    res.status(200).json(updatedgalleryDetails);
  } catch (error) {
    console.error("Error in updating gallery:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

