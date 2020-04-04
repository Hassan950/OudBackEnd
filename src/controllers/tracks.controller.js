const { trackService } = require('../services');
const AppError = require('../utils/AppError');
const multer = require('multer');
const fs = require('fs').promises;
const getMP3Duration = require('get-mp3-duration');
const { albumValidation } = require('../validations');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/tracks');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}-${req.user.artist}-${Date.now()}.mp3`);
  }
});
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
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTrack = upload.single('track');

exports.setTrack = async (req, res, next) => {
  if (!req.file) return next(new AppError('No files were uploaded', 400));
  let track = await trackService.findTrackUtil(req.params.id);
  if (!track) {
    await fs.unlink(req.file.path);
    return next(new AppError('The requested resource is not found', 404));
  }
  if (String(track.artists[0]._id) !== String(req.user.artist)) {
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

exports.getTrack = async (req, res, next) => {
  const track = await trackService.findTrack(req.params.id);
  if (!track)
    return next(new AppError('The requested resource is not found', 404));
  res.status(200).json(track);
};

exports.getTracks = async (req, res, next) => {
  const tracks = await trackService.findTracks(req.query.ids);
  res.status(200).json({
    tracks: tracks
  });
};

exports.deleteTrack = async (req, res, next) => {
  const track = await trackService.findTrack(req.params.id);
  if (!track)
    return next(new AppError('The requested resource is not found', 404));
  if (String(track.artists[0]._id) !== String(req.user.artist))
    return next(
      new AppError(
        'You do not have the permission to perform this action.',
        403
      )
    );

  await trackService.deleteTrack(req.params.id);
  res.status(200).json(track);
};

exports.updateTrack = async (req, res, next) => {
  let track = await trackService.findTrack(req.params.id);
  if (!track)
    return next(new AppError('The requested resource is not found', 404));
    if (String(track.artists[0]._id) !== String(req.user.artist))
    return next(
      new AppError(
        'You do not have the permission to perform this action.',
        403
      )
    );
  if (
    req.body.artists &&
    !(await albumValidation.artistsExist(req.body.artists))
  )
    return next(
      new AppError("The artist ID's given are invalid or doesn't exist", 400)
    );

  track = await trackService.update(req.params.id, req.body);
  res.status(200).json(track);
};
