const { Track } = require('../models/track.model');

/**
 * A method that gets array of tracks By their ID's
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Get list of tracks
 * @param {Array<String>} ids - List of ID's of tracks to be retrieved
 * @returns {Array} An array containing the tracks with nulls against unmatched ID's
 */
exports.findTracks = async ids => {
  const result = await Track.find({ _id: ids })
    .populate('artists album')
    .select('-audioUrl');
  if (result.length == ids.length) return result;
  const tracks = [];
  for (let i = 0, n = ids.length; i < n; i++) {
    const val = result.find(track => String(track._id) === ids[i]);
    tracks[i] = val == undefined ? null : val;
  }
  return tracks;
};

/**
 * A method that deletes a track by it's ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Deletes a track
 * @param {String} id ID of the track to be deleted
 */
exports.deleteTrack = async id => {
  await Track.findByIdAndDelete(id);
};

/**
 * A method that gets a track by it's ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary gets a track
 * @param {String} id ID of the track to be retrieved
 * @returns track if the track was found
 * @returns null the track was not found
 */
exports.findTrack = async id => {
  const track = await Track.findById(id)
    .populate('artists album')
    .select('-audioUrl');
  return track;
};

/**
 * A method that updates a track by it's ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary updates a track
 * @param {String} id ID of the track to be updated
 * @param {object} newTrack object containing the new values
 * @returns Updated track
 */
exports.update = async (id, newTrack) => {
  const track = await Track.findByIdAndUpdate(id, newTrack, { new: true })
    .populate('artists album')
    .select('-audioUrl');
  return track;
};
