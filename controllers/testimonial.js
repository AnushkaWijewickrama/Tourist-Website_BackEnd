const { Storage } = require('@google-cloud/storage');
const path = require('path');
const uuid = require('uuid').v4;
const Testimonial = require('../models/testimonials');

// Initialize Firebase Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, 'fir-78726-firebase-adminsdk-34sx9-1b52a3ed56.json'), // Update with your actual path
  projectId: 'fir-78726', // Replace with your actual project ID
});
const bucket = storage.bucket('gs://fir-78726.appspot.com');
exports.getTestimonials = async (req, res) => {
  const testimonials = await Testimonial.find();
  res.status(200).json(testimonials);
};
exports.getTestimonialsPublic = async (req, res) => {
  const testimonials = await Testimonial.find({ isActive: true });
  res.status(200).json(testimonials);
};
exports.postTestimonial = async (req, res) => {
  const { name, email, subject, isActive, message } = req.body;
  let imagePath = '';

  if (req.file) {
    try {
      // Define the file name with a unique identifier
      const blob = bucket.file(`testimonial/${uuid()}_${req.file.originalname}`);
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

        // Create the Testimonial object and save it to the database
        const testimonial = new Testimonial({
          name,
          email,
          subject,
          isActive,
          imagePath,
          message
        });

        const createdTestimonial = await testimonial.save();

        res.status(201).json({
          Testimonial: {
            ...createdTestimonial._doc,
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
exports.postTestimonialPublic = async (req, res) => {
  const { name, email, subject, isActive, message } = req.body;
  try {
    const testimonial = new Testimonial({
      name,
      email,
      subject,
      message,
      isActive
    });
    const createdTestimonial = await testimonial.save();

    res.status(201).json({
      Testimonial: {
        ...createdTestimonial._doc,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Uploading failed.' });
  }
};

exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, subject, isActive, message } = req.body;


    const updates = {};

    if (req.file) {
      try {
        // Define the file name with a unique identifier
        const blob = bucket.file(`Testimonials/${uuid()}_${req.file.originalname}`);
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
          const updatedTestimonial = await Testimonial.findByIdAndUpdate(id, updates, { new: true });

          if (!updatedTestimonial) {
            return res.status(404).json({ error: "Testimonial not found" });
          }

          res.status(200).json(updatedTestimonial);
        });

        blobStream.end(req.file.buffer);

      } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).json({ message: 'Image processing failed.' });
      }
    } else {
      // If no new image, proceed with updating other fields
      if (name) updates['name'] = name;
      if (email) updates['email'] = email;
      if (subject) updates['subject'] = subject;
      if (isActive) updates['isActive'] = isActive;
      if (message) updates['message'] = message;

      const updatedTestimonial = await Testimonial.findByIdAndUpdate(id, updates, { new: true });

      if (!updatedTestimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }

      res.status(200).json(updatedTestimonial);
    }
  } catch (error) {
    console.error("Error in updateTestimonial:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getTestimonialById = async (req, res) => {
  const testimonial = await Testimonial.findOne({ _id: req?.params?.id });
  res.status(200).json(testimonial);
};

exports.deleteTestimonial = async (req, res) => {
  const { id } = req.params;
  await Testimonial.deleteMany({ _id: id });
  res.status(201).json(await Testimonial.find());;

};