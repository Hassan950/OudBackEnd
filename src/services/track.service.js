const { Track } = require('../models/track.model');
const AppError = require('../utils/AppError');

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
  const result = await Track.find({ _id: ids });

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
 * @param {String} artistId ID of the artist of the current user
 * @returns track if the track was found
 * @throws AppError with status code 404 if the track was not found
 * @throws AppError with status code 403 if artist is not the track's main artist
 */
exports.deleteTrack = async (id, artistId) => {
  const track = await Track.findById(id);
  if (!track) throw new AppError('The requested resource is not found', 404);
  if (!(String(track.artists[0]) === String(artistId)))
    throw new AppError(
      'You do not have permission to perform this action.',
      403
    );
  await Track.findByIdAndDelete(id);
  return track;
};

/**
 * A method that gets a track by it's ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary gets a track
 * @param {String} id ID of the track to be retrieved
 * @returns track if the track was found
 * @throws AppError with status code 404 if the track was not found
 */
exports.findTrack = async id => {
  const track = await Track.findById(id);
  if (!track) throw new AppError('The requested resource is not found', 404);
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
 * @param {String} artistId ID of the artist of the current user
 * @returns Updated track if the track was found
 * @throws AppError with status code 404 if the track was not found
 * @throws AppError with status code 403 if artist is not the track's main artist
 */
exports.update = async (id, newTrack, artistId) => {
  let track = await Track.findById(id);
  if (!track) throw new AppError('The requested resource is not found', 404);
  if (!(String(track.artists[0]) === String(artistId)))
    throw new AppError(
      'You do not have permission to perform this action.',
      403
    );

  track.set(newTrack);
  await track.save();
  return track;
};
