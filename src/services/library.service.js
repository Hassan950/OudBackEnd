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

exports.findAlbums = async ids => {
  const result = await Album.find({ _id: ids });
  if (result.length == ids.length) return result;
  const albums = [];
  for (let i = 0, n = ids.length; i < n; i++) {
    const val = result.find(track => String(album._id) === ids[i]);
    albums[i] = val == undefined ? null : val;
  }
  return albums;
};