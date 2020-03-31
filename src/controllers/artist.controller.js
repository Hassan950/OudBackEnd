const { artistService } = require('../services');
const AppError = require('../utils/AppError');

exports.getArtist = async (req, res, next) => {
  const artist = await artistService.findArtist(req.params.id);
  if (!artist)
    return next(new AppError('The requested resource was not found', 404));
  res.status(200).json({
    artist: artist
  });
};

exports.getArtists = async (req, res, next) => {
  const artists = await artistService.findArtists(req.query.ids);
  res.status(200).json({
    artists: artists
  });
};
