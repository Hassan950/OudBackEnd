const { albumService } = require('../services');
const AppError = require('../utils/AppError');

exports.getAlbum = async (req, res, next) => {
  const album = await albumService.findAlbum(req.params.id);
  if (!album) next(new AppError('The requested resource was not found', 404));
  res.status(200).json({ album: album });
};

exports.getAlbums = async (req, res, next) => {
  let ids = req.query.ids.split(',');
  const albums = await albumService.findAlbums(ids);
  res.status(200).json({
    albums: albums
  });
};

exports.deleteAlbum = async (req, res, next) => {
  const album = await albumService.deleteAlbum(req.params.id, req.user.artist);
  if (!album) next(new AppError('The requested resource is not found', 404));
  res.status(200).json({
    album: album
  });
};

exports.findAlbumTracks = async (req, res, next) => {
  const tracks = await albumService.findTracksOfAlbum(req.params.id);
};

exports.updateAlbum = async (req, res, next) => {
  const album = await albumService.update(
    req.params.id,
    req.body,
    req.user.artist
  );
  if (!album) next(new AppError('The requested resource is not found', 404));
  res.status(200).json({
    album: album
  });
};
