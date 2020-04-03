const { followService } = require('../services');
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
  const checks = await followService.checkFollowings(
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
  const checks = await followService.checkFollowingsPlaylist(
    req.query.ids,
    req.params.playlistId,
    req.user
  );
  res.status(httpStatus.OK).send(checks);
};

/**
 * A middleware to Get the current user’s followed artists/users.
 *
 * @function
 * @author Hassan Mohamed
 * @summary Get User's Followed Artists or Users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

exports.getUserFollowed = async (req, res, next) => {
  const list = await followService.getUserFollowed(req.query, req.user);
  res.status(httpStatus.OK).json({
    items: list.result,
    limit: req.query.limit,
    offset: req.query.offset,
    total: list.total
  });
};

exports.followUser = async (req, res, next) => {
  const ids = req.body.ids ? req.body.ids : req.query.ids;
  if (!ids) {
    return next(
      new AppError('ids should be in query or body', httpStatus.BAD_REQUEST)
    );
  }
  const result = await followService.followUser(ids, req.query.type, req.user);
  if(!result) {
    return next(new AppError('At least one of the ids is not found', httpStatus.NOT_FOUND))
  }
  res.status(httpStatus.NO_CONTENT).end();
};

exports.followPlaylist = async (req, res, next) => {
  // await followService.followPlaylist(req.params.playlistId, req.body.public)
};
