const { Followings, PlaylistFollowings } = require('../models/');
const AppError = require('../utils/AppError');

/**
 * A function that checks if the user follows either this list of users or artists
 *
 * @function
 * @author Hassan Mohamed
 * @summary Check if Current User Follows Artists or Users
 * @param {Array} ids - Array of the ids of the users/artists
 * @param {String} type - type of the references objects artist/user
 * @param {String} userId - The id of the user
 * @returns {Array} Array of booleans contains the results
 */

exports.checkFollowings = async (ids, type, userId) => {
  const result = await Followings.find({
    followedId: ids,
    userId: userId,
    type: type
  });
  const checks = ids.map(id => {
    val = result.find(follow => String(follow.followedId) === id);
    return val !== undefined;
  });
  return checks;
};

/**
 * A function to Check to see if one or more users are following a specified playlist.
 * if a playlist if not public false will be returned unless this is your userId and you are logged in.
 *
 * @function
 * @author Hassan Mohamed
 * @summary Check if Users Follow a Playlist
 * @param {Array} ids - Array of the ids of the users
 * @param {String} playlistId - The playlist id
 * @param {Object} user - The user object. It's undefined if the user is not logged in
 * @returns {Array} Array of booleans contains the results
 */

exports.checkFollowingsPlaylist = async (ids, playlistId, user) => {
  const result = await PlaylistFollowings.find({
    userId: ids,
    playlistId: playlistId
  }).populate({ path: 'playlistId', select: 'public' });
  const checks = ids.map(id => {
    val = result.find(follow => String(follow.userId) === id);
    if (val === undefined) {
      return false;
    }
    if (user && String(user._id) === id) {
      return true;
    }
    return val.playlistId.public;
  });
  return checks;
};
