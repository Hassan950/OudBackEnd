const { trackService } = require('../services');

exports.getTrack = async (req, res, next) => {
  const track = await trackService.findTrack(req.params.id);
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
  const track = await trackService.deleteTrack(req.params.id, req.user.artist);
  res.status(200).json({
    track: track
  });
};

exports.updateTrack = async (req, res, next) => {
  const track = await trackService.update(
    req.params.id,
    req.body,
    req.user.artist
  );
  res.status(200).json({
    track: track
  });
};
