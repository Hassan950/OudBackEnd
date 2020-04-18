const { artistService, albumService, genreService } = require('../services');
const AppError = require('../utils/AppError');
const multer = require('multer');
const fs = require('fs').promises;

/* istanbul ignore next */
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/requests');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `${req.params.id}-${Date.now()}.${ext}`);
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
 * A middleware that gets the Artist with the given ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets an artist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the artist doesn't exist
 */
exports.getArtist = async (req, res, next) => {
  const artist = await artistService.findArtist(req.params.id);
  if (!artist)
    return next(new AppError('The requested resource was not found', 404));
  res.status(200).json(artist);
};

/**
 * A middleware that gets the artists with the given ID's
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets several artists
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getArtists = async (req, res, next) => {
  const artists = await artistService.findArtists(req.query.ids);
  res.status(200).json({
    artists: artists
  });
};

/**
 * A middleware that gets the albums of the artist with the given ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets the albums of an artist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAlbums = async (req, res, next) => {
  const albums = await albumService.findArtistAlbums(
    req.params.id,
    req.query.limit,
    req.query.offset
  );

  res.status(200).json({
    limit: req.query.limit,
    offset: req.query.offset,
    total: albums[1],
    items: albums[0]
  });
};

/**
 * A middleware that gets the popular tracks of the artist with the given ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets the popular tracks of an artist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getTracks = async (req, res, next) => {
  const tracks = await artistService.getPopularSongs(req.params.id);
  if (!tracks)
    return next(new AppError('The requested resource was not found', 404));
  res.status(200).json({
    tracks: tracks
  });
};

/**
 * A middleware that gets the related artists of the artist with the given ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets the related artists of an artist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the artist doesn't exist
 */
exports.relatedArtists = async (req, res, next) => {
  const artists = await artistService.relatedArtists(req.params.id);
  if (!artists)
    return next(new AppError('The requested resource was not found', 404));
  res.status(200).json({
    artists: artists
  });
};

/**
 * A middleware that updates the current artist's data
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Updates the current artist's data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateArtist = async (req, res, next) => {
  const artist = await artistService.update(req.user, req.body);

  if (!artist)
    return next(
      new AppError(
        "The tracks given do not exist or doesn't belong to this artist",
        400
      )
    );
  res.status(200).json({
    artist: artist
  });
};

/**
 * A middleware that Creates an artist request
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Add an artist request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.artistRequest = async (req, res, next) => {
  if (!(await genreService.genresExist(req.body.genres)))
    return next(
      new AppError("The genre ID's given are invalid or doesn't exist", 400)
    );
  const request = await artistService.createRequest(req.body);
  res.status(200).json({
    id: request._id
  });
};

/**
 * A middleware Sets the attachment of a request
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Sets the image of a request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the request doesn't exist
 * @throws AppError 400 Bad request if no files were uploaded
 * @throws AppError 403 forbidden if the request has already been submitted
 */
exports.setAttach = async (req, res, next) => {
  if (!req.file) {
    await artistService.deleteRequest(req.params.id);
    return next(new AppError('No files were uploaded', 400));
  }
  const request = await artistService.getRequest(req.params.id);
  if (!request) {
    await fs.unlink(req.file.path);
    return next(new AppError('The requested resource is not found', 404));
  }
  if (request.attachment !== 'default.jpg') {
    await fs.unlink(req.file.path);
    return next(new AppError('The request has already been submitted', 403));
  }

  await artistService.setAttachment(request, req.file.path);

  return res.status(204).send();
};
