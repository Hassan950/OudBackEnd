const { Track } = require('../models/track.model');
const AppError = require('../utils/AppError');

exports.findTracks = async ids => {
  const tracks = await Track.find({ _id: { $in: ids } });
  // To do: Check for all ids given
  //
  if (!tracks.length)
    throw new AppError('The requested resource is not found', 404);
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
