const { trackService } = require('../services');
const AppError = require('../utils/AppError');
const multer = require('multer');
const fs = require('fs');
const getMP3Duration = require('get-mp3-duration');

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
    fs.unlink(req.file.path, err => {
      if (err) throw err;
    });
    return next(new AppError('The requested resource is not found', 404));
  }
  if (String(track.artists[0]._id) !== String(req.user.artist)) {
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

  if (track.audioUrl !== 'default.mp3') {
    fs.unlink(track.audioUrl, err => {
      if (err) console.log('no such file or directory');
    });
  }

  fs.readFile(req.file.path, async (err, buffer) => {
    const duration = getMP3Duration(buffer);
    track = await trackService.setTrack(track, req.file.path, duration);
  });
  res.status(200).json({
    track: track
  });
};

exports.getTrack = async (req, res, next) => {
  const track = await trackService.findTrack(req.params.id);
  if (!track)
    return next(new AppError('The requested resource is not found', 404));
  res.status(200).json({
    track: track
  });
};

exports.getTracks = async (req, res, next) => {
  let ids = req.query.ids.split(',');
  const tracks = await trackService.findTracks(ids);
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
  res.status(200).json({
    track: track
  });
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

  track = await trackService.update(req.params.id, req.body);
  res.status(200).json({
    track: track
  });
};
