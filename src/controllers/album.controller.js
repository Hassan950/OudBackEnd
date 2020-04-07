const {
  albumService,
  trackService,
  genreService,
  artistService
} = require('../services');
const AppError = require('../utils/AppError');
const multer = require('multer');
const fs = require('fs').promises;
const { albumValidation } = require('../validations');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/albums');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `${req.params.id}-${req.user.artist}-${Date.now()}.${ext}`);
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
  res.status(200).json(album);
};

exports.getAlbums = async (req, res, next) => {
  const albums = await albumService.findAlbums(req.query.ids);
  res.status(200).json({ albums: albums });
};

exports.findAndDeleteAlbum = async (req, res, next) => {
  let album = await albumService.findAlbumUtil(req.params.id);
  if (!album)
    return next(new AppError('The requested resource is not found', 404));
  if (String(album.artists[0]._id) !== String(req.user.artist)) {
    return next(
      new AppError('You do not have permission to perform this action.', 403)
    );
  }
  let trackIds = album.tracks.map(track => track._id);
  album = await albumService.deleteAlbum(req.params.id);

  await albumService.deleteImage(album.image);
  await trackService.deleteTracks(trackIds);
  res.status(200).json(album);
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
    items: tracks[0],
    limit: req.query.limit,
    offset: req.query.offset,
    total: tracks[1]
  });
};

exports.updateAlbum = async (req, res, next) => {
  let album = await albumService.findAlbumUtil(req.params.id);
  if (!album)
    return next(new AppError('The requested resource is not found', 404));
  if (
    album.released ||
    String(album.artists[0]._id) !== String(req.user.artist)
  )
    return next(new AppError('Forbidden.', 403));
  if (
    req.body.artists &&
    !(await albumValidation.artistsExist(req.body.artists))
  )
    return next(
      new AppError("The artist ID's given are invalid or doesn't exist", 400)
    );

  if (req.body.genres && !(await genreService.genresExist(req.body.genres)))
    return next(
      new AppError("The genre ID's given are invalid doesn't exist", 400)
    );
  album = await albumService.update(req.params.id, req.body);
  res.status(200).json(album);
};

exports.setImage = async (req, res, next) => {
  if (!req.file) return next(new AppError('No files were uploaded', 400));
  let album = await albumService.findAlbumUtil(req.params.id);
  if (!album) {
    await fs.unlink(req.file.path);
    return next(new AppError('The requested resource is not found', 404));
  }
  if (
    album.released ||
    String(album.artists[0]._id) !== String(req.user.artist)
  ) {
    await fs.unlink(req.file.path);
    return next(
      new AppError(
        'You do not have the permission to perform this action.',
        403
      )
    );
  }
  await albumService.deleteImage(album.image);
  album = await albumService.setImage(album, req.file.path);
  res.status(200).json(album);
};

exports.createAlbum = async (req, res, next) => {
  if (!(await artistService.artistsExist(req.body.artists)))
    return next(
      new AppError("The artist ID's given are invalid or doesn't exist", 400)
    );

  if (!(await genreService.genresExist(req.body.genres)))
    return next(
      new AppError("The genre ID's given are invalid or doesn't exist", 400)
    );

  const album = await albumService.createAlbum(req.body);
  res.status(200).json(album);
};

exports.newTrack = async (req, res, next) => {
  let album = await albumService.findAlbumUtil(req.params.id);
  if (!album)
    return next(new AppError('The requested resource is not found', 404));
  if (
    album.released ||
    String(album.artists[0]._id) !== String(req.user.artist)
  )
    return next(new AppError('Forbidden.', 403));

  if (!(await artistService.artistsExist(req.body.artists)))
    return next(
      new AppError("The artist ID's given are invalid or doesn't exist", 400)
    );

  let track = await trackService.createTrack(req.params.id, req.body);
  album = await albumService.addTrack(album, track._id);
  res.status(200).json(album);
};
