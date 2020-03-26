const { albumService } = require('../services');
const AppError = require('../utils/AppError');

exports.getAlbum = async (req, res, next) => {
  const album = await albumService.findAlbum(req.params.id);
  if (!album)
    return next(new AppError('The requested resource was not found', 404));
  res.status(200).json({ album: album });
};

exports.getAlbums = async (req, res, next) => {
  let ids = req.query.ids.split(',');
  const albums = await albumService.findAlbums(ids);
  res.status(200).json({
    albums: albums
  });
};

exports.findAndDeleteAlbum = async (req, res, next) => {
  const album = await albumService.findAlbum(req.params.id);
  if (!album)
    return next(new AppError('The requested resource is not found', 404));
  if (!(String(album.artists[0]._id) === String(req.user.artist))) {
    return next(
      new AppError('You do not have permission to perform this action.', 403)
    );
  }
  await albumService.deleteAlbum(req.params.id);
  res.status(200).json({
    album: album
  });
};

exports.findAlbumTracks = async (req, res, next) => {
  const tracks = await albumService.findTracksOfAlbum(
    req.params.id,
    req.query.limit,
    req.query.offset
  );

  if (!tracks)
    return next(new AppError('The requested resource is not found', 404));
  res.status(200).json({
    items: tracks,
    limit: req.query.limit,
    offset: req.query.offset,
    total: tracks.length
  });
};

exports.releaseAlbum = async (req, res, next) => {
  let album = await albumService.findAlbum(req.params.id);
  if (!album)
    return next(new AppError('The requested resource is not found', 404));
  if (!(String(album.artists[0]._id) === String(req.user.artist)))
    return next(
      new AppError(
        'You do not have the permission to perform this action.',
        403
      )
    );
  album = await albumService.update(req.params.id, req.body);
  res.status(200).json({
    album: album
  });
};

exports.updateAlbum = async (req, res, next) => {
  const album = await albumService.update(
    req.params.id,
    req.body,
    req.user.artist
  );
  if (!album)
    return next(new AppError('The requested resource is not found', 404));
  res.status(200).json({
    album: album
  });
};
