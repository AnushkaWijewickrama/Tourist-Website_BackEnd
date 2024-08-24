const Banner = require('../models/banner');
exports.getBanners = async (req, res) => {
  const banners = await Banner.find();
  res.status(200).json(banners);
};

exports.postBanner = async (req, res) => {
  const { title, description, isVideo, videoPath } = req.body;
  let imagePath = '';
  if (isVideo != true) {
    if (req.file) {
      imagePath = process.env.PROTOCOL + '://' + req.get('host') + '/banner/' + req.file.filename;
    }
  }

  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Creating banner failed.' });
  }
};

exports.deleteBanner = async (req, res) => {
  const { id } = req.params;
  await Banner.deleteMany({ _id: id });
  res.status(201).json(await Banner.find());;

};
