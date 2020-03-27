const { albumService } = require('../services');
const AppError = require('../utils/AppError');
const multer = require('multer');
const fs = require('fs');
const { albumValidation } = require('../validations');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/albums');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `${req.body.name}-${req.user.artist}-${Date.now()}.${ext}`);
  }
});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.split('/')[1].match(/(png|jpg|jpeg)/)) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadImage = upload.single('image');

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
  if (String(album.artists[0]._id) !== String(req.user.artist)) {
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

exports.updateAlbum = async (req, res, next) => {
  let album = await albumService.findAlbum(req.params.id);
  if (!album)
    return next(new AppError('The requested resource is not found', 404));
    if (
    album.released ||
    String(album.artists[0]._id) !== String(req.user.artist)
  )
    return next(new AppError('Forbidden.', 403));
  album = await albumService.update(req.params.id, req.body);
  res.status(200).json({
    album: album
  });
};

exports.setImage = async (req, res, next) => {
  let album;
  if (req.params.id) {
    album = await albumService.findAlbum(req.params.id);
  }
  if (!album) {
    fs.unlink(req.file.path, err => {
      if (err) throw err;
    });
    return next(new AppError('The requested resource is not found', 404));
  }
  if (
    album.released ||
    String(album.artists[0]._id) !== String(req.user.artist)
  ) {
    fs.unlink(req.file.path, err => {
      if (err) throw err;
    });
    return next(
      new AppError(
        'You do not have the permission to perform this action.',
        403
      )
    );
  }

  album = await albumService.setImage(album, req.file.path);
  res.status(200).json({
    album: album
  });
};

exports.createAlbum = async (req, res, next) => {
  const album = await albumService.createAlbum(req.body);
  res.status(200).json({
    album: album
  });
};
