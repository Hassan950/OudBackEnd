const { Track } = require('../models/track.model');
const AppError = require('../utils/AppError');
const _ = require('lodash');

exports.findTracks = async ids => {
  const result = await Track.find({ _id: ids });
  if (!result.length)
    throw new AppError('The requested resource is not found', 404);

  if (result.length == ids.length) return result;
  const tracks = [];
  for (let i = 0, n = ids.length; i < n; i++) {
    const val = result.find(track => track._id == ids[i]);
    tracks[i] = val == undefined ? null : val;
  }
  return tracks;
};

exports.deleteTrack = async (id, artistId) => {
  const track = await Track.findById(id);
  if (!track) throw new AppError('The requested resource is not found', 404);
  if (!track.artists.find(aId => String(aId) == String(artistId)))
    throw new AppError(
      'You do not have permission to perform this action.',
      403
    );
  await Track.findByIdAndDelete(id);
  return track;
};

exports.findTrack = async id => {
  const track = await Track.findById(id);
  if (!track) throw new AppError('The requested resource is not found', 404);
  return track;
};

// Update track service
// new track contains the properties to update which may be one of (name, artists) or both
exports.update = async (id, newTrack, artistId) => {
  let track = await Track.findById(id);
  if (!track) throw new AppError('The requested resource is not found', 404);
  // console.log(artistId)
  // console.log(track.artists)
  if (!track.artists.find(aId => aId.toString() == artistId.toString()))
    throw new AppError(
      'You do not have permission to perform this action.',
      403
    );

  track.set(newTrack);
  track.save();
  return track;
};
