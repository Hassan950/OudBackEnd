const { trackService, artistService, albumService } = require('../services');
const AppError = require('../utils/AppError');
const multer = require('multer');
const fs = require('fs').promises;
const getMP3Duration = require('get-mp3-duration');
const path = require('path');

/* istanbul ignore next */
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/tracks');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}-${req.user._id}-${Date.now()}.mp3`);
  }
});

/* istanbul ignore next */
const multerFilter = (req, file, cb) => {
  if (file.mimetype.split('/')[1].match(/(mpeg)/)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Not an mp3, Please only upload files with mp3 extention.',
        400
      ),
      false
    );
  }
};

/* istanbul ignore next */
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

/**
 * calls multer to upload a track that is in req.body.track and put it in req.file
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary A middleware that uses multer to upload a track
 */
/* istanbul ignore next */
exports.uploadTrack = upload.single('track');

/**
 * A middleware Sets the file of a track
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Sets the file of a track
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the track doesn't exist
 * @throws AppError 403 Forbidden if the artist is not the track's main artist
 * @throws AppError 400 Bad request if no files were uploaded
 */
exports.setTrack = async (req, res, next) => {
  if (!req.file) return next(new AppError('No files were uploaded', 400));
  let track = await trackService.findTrackUtil(req.params.id);
  if (!track) {
    await fs.unlink(req.file.path);
    return next(new AppError('The requested resource is not found', 404));
  }
  if (String(track.artists[0]._id) !== String(req.user._id)) {
    await fs.unlink(req.file.path);
    return next(
      new AppError(
        'You do not have the permission to perform this action.',
        403
      )
    );
  }

  await trackService.checkFile(req.params.id);

  const duration = getMP3Duration(await fs.readFile(req.file.path));
  track = await trackService.setTrack(track, req.file.path, duration);
  res.status(200).json(track);
};

/**
 * A middleware that gets the track with the given ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets a track
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the track doesn't exist
 */
exports.getTrack = async (req, res, next) => {
  const track = await trackService.findTrack(req.params.id, req.user);
  if (track instanceof AppError) return next(track);
  res.status(200).json(track);
};

/**
 * A middleware that gets the tracks with the given ID's
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets several tracks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getTracks = async (req, res, next) => {
  const tracks = await trackService.findTracks(req.query.ids, req.user);
  res.status(200).json({
    tracks: tracks
  });
};

/**
 * A middleware that deletes the track with the given ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Deletes a track
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the track doesn't exist
 * @throws AppError 403 forbidden if the artist is not the track's main artist
 */
exports.deleteTrack = async (req, res, next) => {
  const track = await trackService.findTrackUtil(req.params.id);
  if (!track)
    return next(new AppError('The requested resource is not found', 404));
  if (String(track.artists[0]._id) !== String(req.user._id))
    return next(
      new AppError(
        'You do not have the permission to perform this action.',
        403
      )
    );
  await albumService.removeTrack(track.album._id, req.params.id);
  await trackService.deleteTrack(req.params.id);
  res.status(200).json(track);
};

/**
 * A middleware that updates the track with the given ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Updates a track
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the track doesn't exist
 * @throws AppError 400 bad request if any of the new data is invalid
 * @throws AppError 403 forbidden if the artist is not the track's main artist
 */
exports.updateTrack = async (req, res, next) => {
  let track = await trackService.findTrackUtil(req.params.id);
  if (!track)
    return next(new AppError('The requested resource is not found', 404));
  if (String(track.artists[0]._id) !== String(req.user._id))
    return next(
      new AppError(
        'You do not have the permission to perform this action.',
        403
      )
    );
  if (req.body.artists) {
    const result = await artistService.artistsExist(
      req.body.artists,
      req.user._id
    );
    if (result instanceof AppError) return next(result);
  }

  track = await trackService.update(req.params.id, req.body);
  res.status(200).json(track);
};

/**
 * Download a track with the given track ID
 *
 * @function
 * @author Abdelrahman Tarek
 * @summary Downloads a track
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the track doesn't exist
 * @throws AppError 400 bad request if any of the new data is invalid
 * @throws AppError 403 forbidden if the user is not premium
 */
exports.downloadTrack = async (req, res, next) => {
  const trackId = req.params.id;

  const audioUrl = await trackService.getTrackAudioUrl(trackId);

  if (!audioUrl) return next(new AppError('Track is not found', 404));

  res.download(audioUrl);
};
