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

/* istanbul ignore next */
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/albums');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `${req.params.id}-${req.user.artist}-${Date.now()}.${ext}`);
  }
});

/* istanbul ignore next */
const multerFilter = (req, file, cb) => {
  if (file.mimetype.split('/')[1].match(/(png|jpg|jpeg)/)) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

/* istanbul ignore next */
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});


/**
 * calls multer to upload an image that is in req.body.image and put it in req.file
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary A middleware that uses multer to upload an image
 */
/* istanbul ignore next */
exports.uploadImage = upload.single('image');

/**
 * A middleware that gets the album with the given ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets an album
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the album doesn't exist
 */
exports.getAlbum = async (req, res, next) => {
  const album = await albumService.findAlbum(req.params.id);
  if (!album)
    return next(new AppError('The requested resource was not found', 404));
  res.status(200).json(album);
};

/**
 * A middleware that gets the albums with the given ID's
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets several albums
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAlbums = async (req, res, next) => {
  const albums = await albumService.findAlbums(req.query.ids);
  res.status(200).json({ albums: albums });
};

/**
 * A middleware that deletes the album with the given ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Deletes an album
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the album doesn't exist
 * @throws AppError 403 forbidden if the artist is not the album's main artist
 */
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

/**
 * A middleware that gets the tracks on the album with the given ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets the tracks of an album
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the album doesn't exist
 */
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

/**
 * A middleware that updates the album with the given ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Updates an album
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the album doesn't exist
 * @throws AppError 400 bad request if any of the new data is invalid
 * @throws AppError 403 forbidden if the artist is not the album's main artist
*/
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

/**
 * A middleware Sets the image of an album
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Sets the image of an album
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the album doesn't exist
 * @throws AppError 403 Forbidden if the artist is not the album's main artist
 * @throws AppError 400 Bad request if no files were uploaded
 */
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

/**
 * A middleware that creates an album
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Creates an album
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 400 Bad request if the ID's given doesn't exist
 */
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

/**
 * A middleware that Adds a new track to an album
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Adds a track to an album
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the album doesn't exist
 * @throws AppError 400 Bad request if the ID's given doesn't exist
 */
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
