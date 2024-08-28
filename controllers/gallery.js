const galleryDetails = require('../models/gallery');

exports.getgallery = async (req, res) => {
  const gallerys = await galleryDetails.find();
  res.status(200).json(gallerys);
};

exports.postgallery = async (req, res) => {
  const { title, description } = req.body;
  let imagePath = []
  const imageData = req?.files?.image


  if (Array.isArray(imageData)) {
    imageData.forEach(element => {
      imagePath.push(process.env.PROTOCOL + '://' + req.get('host') + '/gallery/' + element.filename);
    });
  }
  const gallery = new galleryDetails({
    title,
    description,
    imagePath
  });

  const createdgallery = await gallery.save();
  res.status(201).json({
    gallery: {
      ...createdgallery._doc,
    },
  });
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

