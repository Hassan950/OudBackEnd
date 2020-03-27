const { followingService } = require('../services');
const AppError = require('../utils/AppError');
const httpStatus = require('http-status');

/**
 * A middleware to Check to see if the current user is following one or more artists or other users.
 *
 * @function
 * @author Hassan Mohamed
 * @summary Check if Current User Follows Artists or Users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

exports.checkFollowings = async (req, res, next) => {
  const checks = await followingService.checkFollowings(
    req.query.ids,
    req.query.type,
    req.user._id
  );
  res.status(httpStatus.OK).send(checks);
};

/**
 * A middleware to Check to see if one or more users are following a specified playlist.
 *
 * @function
 * @author Hassan Mohamed
 * @summary Check if Users Follow a Playlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

exports.checkFollowingsPlaylist = async (req, res, next) => {
  const checks = await followingService.checkFollowingsPlaylist(
    req.query.ids,
    req.params.playlistId,
    req.user
  );
  res.status(httpStatus.OK).send(checks);
};
