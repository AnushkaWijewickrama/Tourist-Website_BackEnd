const { Storage } = require('@google-cloud/storage');
const path = require('path');
const Product = require('../models/products');
const uuid = require('uuid').v4;

// Initialize Firebase Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, 'fir-78726-firebase-adminsdk-34sx9-1b52a3ed56.json'), // Update with your actual path
  projectId: 'fir-78726', // Replace with your actual project ID
});
const bucket = storage.bucket('gs://fir-78726.appspot.com');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getProduct = async (req, res) => {
  const { id } = req.params
  const product = await Product.findOne({ _id: id });
  res.status(200).json(product);
};
exports.postProduct = async (req, res) => {
  const { title, description, latest, price, productDetails, priceActive } = req.body;

  // Check if a file is uploaded
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Generate a unique file name
    const blob = bucket.file(`product/${uuid()}_${req.file.originalname}`);

    // Create a stream to upload the file
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: req.file.mimetype,
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: uuid(),
        },
      },
    });

    // Handle errors during file upload
    blobStream.on('error', (err) => {
      console.error('Error uploading image to Firebase:', err);
      return res.status(500).json({ message: 'Failed to upload image to Firebase Cloud Storage.' });
    });

    // Handle file upload success
    blobStream.on('finish', async () => {
      // Make the file publicly accessible
      await blob.makePublic();

      // Get the public URL of the uploaded file
      const imagePath = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      // Create and save the product details entry
      const product = new Product({
        title,
        description,
        imagePath,
        latest,
        price,
        productDetails,
        priceActive,
      });

      // Save the product to the database
      const createProduct = await product.save();

      // Respond with the newly created product
      res.status(201).json({
        product: {
          ...createProduct._doc,
        },
      });
    });

    // End the stream
    blobStream.end(req.file.buffer);

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Product creation failed.', error });
  }
};
exports.deleteProductById = async (req, res) => {
  const { id } = req.params;
  await Product.deleteMany({ _id: id });
  res.status(201).json(await Product.find());;

};
exports.postProductSingle = async (req, res) => {
  const { title, description, brand } = req.body;

  const imagePath = process.env.PROTOCOL + '://' + req.get('host') + '/product-details/' + req.file.filename; // Note: set path dynamically
  const product = new Product({
    title,
    description,
    imagePath,
  });

  const createdProduct = await product.save();
  res.status(201).json({
    product: {
      ...createdProduct._doc,
    },
  });
};
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, latest, productDetails, priceActive } = req.body;
    let imagePath;

    // Check if there's a file to update the image
    if (req.file) {
      // Upload the new image to Google Cloud Storage
      const blob = bucket.file(`products/${uuid()}_${req.file.originalname}`);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: req.file.mimetype,
        metadata: {
          metadata: {
            firebaseStorageDownloadTokens: uuid(),
          },
        },
      });

      // Handle error during file upload
      blobStream.on('error', (err) => {
        console.error('Error uploading image to Firebase:', err);
        return res.status(500).json({ message: 'Failed to upload image to Firebase Cloud Storage.' });
      });

      // Finish the upload and get the public URL
      await new Promise((resolve, reject) => {
        blobStream.on('finish', async () => {
          try {
            // Make the file publicly accessible
            await blob.makePublic();
            // Get the public URL of the uploaded image
            imagePath = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            resolve();
          } catch (err) {
            reject(err);
          }
        });
        blobStream.end(req.file.buffer);
      });
    }

    // Create an updates object
    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (imagePath) updates.imagePath = imagePath; // Only update imagePath if a new image was uploaded
    if (price) updates.price = price;
    if (priceActive !== undefined) updates.priceActive = priceActive;
    if (latest !== undefined) updates.latest = latest;
    if (productDetails) updates.productDetails = productDetails;

    // Find the product by ID and update it
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });

    // Handle case when the product is not found
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Respond with the updated product
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getProductById = async (req, res) => {
  const product = await Product.findOne({ _id: req?.params?.id });
  res.status(200).json(product);
};