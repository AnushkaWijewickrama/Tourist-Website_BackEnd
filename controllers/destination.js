const Destination = require('../models/destination');

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
  const imagePath = process.env.PROTOCOL + '://' + req.get('host') + '/destination/' + req.file.filename; // Note: set path dynamically
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
};
exports.deleteDestinationById = async (req, res) => {
  const { id } = req.params;
  await Destination.deleteMany({ _id: id });
  res.status(201).json(await Destination.find());;

};
exports.postDestinationSingle = async (req, res) => {
  const { title, description } = req.body;

  const imagePath = process.env.PROTOCOL + '://' + req.get('host') + '/destination/' + req.file.filename; // Note: set path dynamically
  const Destination = new Destination({
    title,
    description,
    imagePath,
  });

  const createdDestination = await Destination.save();
  res.status(201).json({
    Destination: {
      ...createdDestination._doc,
    },
  });
};
exports.updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, latest, discount, location } = req.body;

    let imagePath;
    if (req?.file?.filename) {
      imagePath = process.env.PROTOCOL + '://' + req.get('host') + '/destination/' + req?.file?.filename;
    }
    const updates = {};
    if (title) updates['title'] = title;
    if (description) updates['description'] = description;
    if (imagePath) updates['imagePath'] = imagePath;
    if (price) updates['price'] = price;
    if (latest) updates['latest'] = latest;
    if (discount) updates['discount'] = discount;
    if (location) updates['location'] = location;
    const updatedDestination = await Destination.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedDestination) {
      return res.status(404).json({ error: "Destination not found" });
    }
    res.status(200).json(updatedDestination);
  } catch (error) {
    console.error("Error in updateDestination:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getDestinationById = async (req, res) => {
  const destination = await Destination.findOne({ _id: req?.params?.id });
  res.status(200).json(destination);
};