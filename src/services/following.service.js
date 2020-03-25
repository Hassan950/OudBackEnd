const { Followings } = require('../models/');
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
