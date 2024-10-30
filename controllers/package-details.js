const { Storage } = require('@google-cloud/storage');
const path = require('path');
const uuid = require('uuid').v4;
const PackageDetails = require('../models/package-details');

// Initialize Firebase Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, 'fir-78726-firebase-adminsdk-34sx9-1b52a3ed56.json'), // Update with your actual path
  projectId: 'fir-78726', // Replace with your actual project ID
});
const bucket = storage.bucket('gs://fir-78726.appspot.com');

exports.getPackageDetails = async (req, res) => {
  const PackageDetail = await PackageDetails.find();
  res.status(200).json(PackageDetail);
};
exports.getPackageDetailsByPackageId = async (req, res) => {
  const { id } = req.params;
  PackageDetails
    .findOne({ _id: id })
    .then(PackageDetails => {
      res.json(PackageDetails);
    });

};
exports.postPackageDetails = async (req, res) => {
  const { title, description, longDescription } = req.body;
  const imageData = req?.files?.image;
  const imagePath = [];

  if (Array.isArray(imageData)) {
    try {
      const uploadPromises = imageData.map(async (element) => {
        return new Promise((resolve, reject) => {
          // Define the file name with a unique identifier
          const blob = bucket.file(`Package-details/${uuid()}_${element.originalname}`);
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

      // Create and save the Package details entry
      const Package = new PackageDetails({
        title,
        description,
        longDescription,
        imagePath
      });

      const createdPackage = await Package.save();
      res.status(201).json({
        Package: {
          ...createdPackage._doc,
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

exports.deletePackageDetails = async (req, res) => {
  const { id } = req.params;
  await PackageDetails.deleteMany({ _id: id });
  res.status(201).json(await PackageDetails.find());;

};
exports.getPackageDetailsById = async (req, res) => {
  const brand = await PackageDetails.findOne({ _id: req?.params?.id });
  res.status(200).json(brand);
};
exports.updatePackageDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, longDescription } = req.body;
    // Array to hold new image URLs
    let newImages = [];

    // Check if the request contains images
    if (req.files && req.files.image) {
      const imageData = req.files.image;
      const uploadPromises = [];

      if (Array.isArray(imageData)) {
        // Handle multiple image uploads
        uploadPromises.push(
          ...imageData.map((file) => {
            return new Promise((resolve, reject) => {
              const blob = bucket.file(`Package-details/${uuid()}_${file.originalname}`);
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
                console.error("Error uploading image to Firebase:", err);
                reject(err);
              });

              blobStream.on('finish', async () => {
                // Make the file public
                await blob.makePublic();
                // Get the public URL
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                newImages.push(publicUrl);
                resolve();
              });

              blobStream.end(file.buffer);
            });
          })
        );
      } else {
        // Handle single image upload
        uploadPromises.push(
          new Promise((resolve, reject) => {
            const blob = bucket.file(`Package-details/${uuid()}_${imageData.originalname}`);
            const blobStream = blob.createWriteStream({
              resumable: false,
              contentType: imageData.mimetype,
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
              // Get the public URL
              const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
              newImages.push(publicUrl);
              resolve();
            });

            blobStream.end(imageData.buffer);
          })
        );
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
    }

    // Find the Package details by ID
    const packageDetails = await PackageDetails.findById(id);

    // If Package not found, return 404
    if (!packageDetails) {
      return res.status(404).json({ error: "Package not found" });
    }

    // Check if there are existing images that should be retained
    const updatedImages = packageDetails.imagePath.filter((data) =>
      req.body?.image?.includes(data)
    );

    // Combine updated and new images
    const finalImages = updatedImages.concat(newImages);

    // Update fields
    const updates = {};
    if (title) updates['title'] = title;
    if (description) updates['description'] = description;
    if (longDescription) updates['longDescription'] = longDescription;
    updates['imagePath'] = finalImages;

    // Update Package details
    const updatedPackageDetails = await PackageDetails.findByIdAndUpdate(id, updates, { new: true });

    // Send updated Package details in the response
    res.status(200).json(updatedPackageDetails);
  } catch (error) {
    console.error("Error in updating Package:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

