const { trackService } = require('../services');
const AppError = require('../utils/AppError');

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
  if (!(String(track.artists[0]._id) === String(req.user.artist)))
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
  if (!(String(track.artists[0]._id) === String(req.user.artist)))
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
