const package = require('../models/package');

exports.getpackages = async (req, res) => {
  try {
    const packages = await package.find().select('price imagePath title description latest');
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getpackage = async (req, res) => {
  const { id } = req.params
  const package = await package.findOne({ _id: id });
  res.status(200).json(package);
};

exports.postpackage = async (req, res) => {
  const { title, description, latest, price } = req.body;
  const imagePath = process.env.PROTOCOL + '://' + req.get('host') + '/packages/' + req.file.filename; // Note: set path dynamically
  const package = new package({
    title,
    description,
    imagePath,
    latest,
    price
  });

  const createdpackage = await package.save();
  res.status(201).json({
    package: {
      ...createdPackage._doc,
    },
  });
};
exports.deletepackageById = async (req, res) => {
  const { id } = req.params;
  await package.deleteMany({ _id: id });
  res.status(201).json(await package.find());;

};
exports.postpackageSingle = async (req, res) => {
  const { title, description, brand } = req.body;

  const imagePath = process.env.PROTOCOL + '://' + req.get('host') + '/package-details/' + req.file.filename; // Note: set path dynamically
  const package = new package({
    title,
    description,
    imagePath,
  });

  const createdpackage = await package.save();
  res.status(201).json({
    package: {
      ...createdpackage._doc,
    },
  });
};
exports.updatepackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, latest } = req.body;

    let imagePath;
    if (req?.file?.filename) {
      imagePath = process.env.PROTOCOL + '://' + req.get('host') + '/packages/' + req?.file?.filename;
    }
    const updates = {};
    if (title) updates['title'] = title;
    if (description) updates['description'] = description;
    if (imagePath) updates['imagePath'] = imagePath;
    if (price) updates['price'] = price;
    if (latest) updates['latest'] = latest;
    const updatedpackage = await package.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedpackage) {
      return res.status(404).json({ error: "package not found" });
    }
    res.status(200).json(updatedpackage);
  } catch (error) {
    console.error("Error in updatepackage:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getpackageById = async (req, res) => {
  const package = await package.findOne({ _id: req?.params?.id });
  res.status(200).json(package);
};