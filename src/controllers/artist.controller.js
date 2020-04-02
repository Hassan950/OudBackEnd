const { artistService, albumService } = require('../services');
const AppError = require('../utils/AppError');

exports.getArtist = async (req, res, next) => {
  const artist = await artistService.findArtist(req.params.id);
  if (!artist)
    return next(new AppError('The requested resource was not found', 404));
  res.status(200).json(artist);
};

exports.getArtists = async (req, res, next) => {
  const artists = await artistService.findArtists(req.query.ids);
  res.status(200).json({
    artists: artists
  });
};

exports.getAlbums = async (req, res, next) => {
  const albums = await albumService.findArtistAlbums(
    req.params.id,
    req.query.limit,
    req.query.offset
  );
  if (!albums)
    return next(new AppError('The requested resource was not found', 404));

  res.status(200).json({
    limit: req.query.limit,
    offset: req.query.offset,
    total: albums[1],
    items: albums[0]
  });
};

exports.getTracks = async (req, res, next) => {
  const tracks = await artistService.getPopularSongs(req.params.id);
  if (!tracks)
    return next(new AppError('The requested resource was not found', 404));
  res.status(200).json({
    tracks: tracks
  });
};

exports.relatedArtists = async (req, res, next) => {
  const artists = await artistService.relatedArtists(req.params.id);
  if (!artists)
    return next(new AppError('The requested resource was not found', 404));
  res.status(200).json({
    artists: artists
  });
};
