const { Track } = require('../models/track.model');
const AppError = require('../utils/AppError');

exports.findTracks = async ids => {
  const result = await Track.find({ _id: { $in: ids } }).limit(50);

  if (!result.length)
    throw new AppError('The requested resource is not found', 404);

  if (result.length == ids.length) return result;

  const tracks = [];

  for (let i = 0, n = ids.length; i < n; i++) {
    const val = result.find(track => {
      return track.id == ids[i];
    });

    tracks[i] = val == undefined ? null : val;
  }

  return tracks;
};

exports.deleteTrack = async id => {
  const track = await Track.findByIdAndDelete(id);
  if (!track) throw new AppError('The requested resource is not found', 404);
  return track;
};

exports.findTrack = async id => {
  const track = await Track.findById(id);
  if (!track) throw new AppError('The requested resource is not found', 404);
  return track;
};
