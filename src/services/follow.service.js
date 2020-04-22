const {
  Followings,
  PlaylistFollowings,
  User,
  Playlist
} = require('../models');
const _ = require('lodash');

/**
 * A function that finds the user by id
 *
 * @function
 * @author Hassan Mohamed
 * @summary Find user by Id
 * @param {String} id - The id of the user
 * @returns {Object|undefined} The user or undefined incase of there's no user
 */

exports.checkUser = async id => {
  return await User.findById(id).select('id').lean();
};

/**
 * A utility function that get followed users/artists for the passed user id
 *
 * @function
 * @author Hassan Mohamed
 * @summary Get Followed User/artist for the id passed
 * @param {String} id - The id of the user
 * @param {object} query - the query parameters
 * @returns {Array} Array of users followed
 */

const getFollowedUtil = async (query, id) => {
  const followings = await Followings.find({
    userId: id,
    type: query.type
  })
    .select('-_id')
    .populate({ path: 'followedId', select: 'displayName images verified' })
    .skip(query.offset)
    .limit(query.limit);

  return _.map(followings, following => {
    return following.followedId;
  });
};

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
  const playlistPromise = Playlist.findById(playlistId)
    .select('public')
    .exec();
  const resultPromise = PlaylistFollowings.find({
    userId: ids,
    playlistId: playlistId
  }).exec();
  const [playlist, result] = await Promise.all([
    playlistPromise,
    resultPromise
  ]);
  const checks = ids.map(id => {
    val = result.find(follow => String(follow.userId) === id);
    if (val === undefined) {
      return false;
    }
    if (user && String(user._id) === id) {
      return true;
    }
    return playlist.public;
  });
  return checks;
};

/**
 * A function to Get the passed user’s id followed artists/users.
 *
 * @function
 * @author Hassan Mohamed
 * @summary Get the current user’s followed artists/users.
 * @param {Object} query - The query parameters of the request
 * @param {String} id - The id of the user
 * @returns {Object} Contains the resultant list and the total count of the documents
 */

exports.getUserFollowed = async (query, id) => {
  const resultPromise = getFollowedUtil(query, id);
  const totalPromise = Followings.countDocuments({
    userId: id,
    type: query.type
  }).exec();
  
  const [result, total] = await Promise.all([resultPromise, totalPromise]);
  return { result, total };
};

/**
 * A function to Get the passed user’s id followers.
 *
 * @function
 * @author Hassan Mohamed
 * @summary Get the current user’s followers.
 * @param {Object} query - The query parameters of the request
 * @param {String} id - The id of the user
 * @returns {Object} Contains the resultant list and the total count of the documents
 */

exports.getUserFollowers = async (query, id) => {
  const followings = await Followings.find({
    followedId: id
  })
    .select('-_id')
    .populate({ path: 'userId', select: 'displayName images verified' })
    .skip(query.offset)
    .limit(query.limit);
  const resultPromise = _.map(followings, following => {
    return following.userId;
  });
  const totalPromise = Followings.countDocuments({
    followedId: id
  }).exec();
  const [result, total] = await Promise.all([resultPromise, totalPromise]);
  return { result, total };
};

/**
 * A function to Add the current user as a follower of one or more artists or other users
 *
 * @function
 * @author Hassan Mohamed
 * @summary Follow Artists or Users.
 * @param {Array} ids - Array of objectIds to follow
 * @param {String} type - The type of the ids Artist/User
 * @param {Object} user - The user object
 * @returns {Boolean|null} True if done successfully or null if one of the ids is not associated by artist/user
 */

exports.followUser = async (ids, type, user) => {
  ids = _.uniq(ids);
  const users = await User.find({ _id: ids, type: type });
  if (users.length < ids.length) {
    return null;
  }
  const promises = [];
  _.map(users, followed => {
    promises.push(
      Followings.create({ userId: user._id, followedId: followed, type: type })
    );
  });
  await Promise.all(promises);
  return true;
};

/**
 * A function to Add the current user as a follower of one or more artists or other users
 *
 * @function
 * @author Hassan Mohamed
 * @summary Follow Artists or Users.
 * @param {Array} ids - Array of objectIds to follow
 * @param {String} type - The type of the ids Artist/User
 * @param {Object} user - The user object
 * @returns {Boolean|null} True if done successfully or null if one of the ids is not associated by artist/user
 */

exports.unfollowUser = async (ids, type, user) => {
  ids = _.uniq(ids);
  const users = await User.find({ _id: ids, type: type });
  if(!users || users.length < ids.length) return false
  await Followings.deleteMany({
    userId: user._id,
    followedId: users,
    type: type
  });
  return true;
};

/**
 * A function to Add the current user as a follower of a playlist
 *
 * @function
 * @author Hassan Mohamed
 * @summary Follow a Playlist
 * @param {String} playlistId - The ID of the playlist.
 * @param {Boolean} publicity - If true the playlist will be included in user’s public playlists, if false it will remain private.
 * @param {Object} user - The user object
 * @returns {Boolean|null} True if done successfully or null if the id is not associated by playlist
 */

exports.followPlaylist = async (playlistId, publicity, user) => {
  const playlist = await Playlist.findById(playlistId).select('id').lean();
  if (!playlist) return null;
  await PlaylistFollowings.create({
    playlistId: playlistId,
    userId: user._id,
    public: publicity
  });
  return true;
};

/**
 * A function to Remove the current user as a follower of a playlist.
 *
 * @function
 * @author Hassan Mohamed
 * @summary Unfollow a Playlist
 * @param {String} playlistId - The ID of the playlist.
 * @param {Object} user - The user object
 * @returns {Boolean|null} True if done successfully or null if the id is not associated by playlist
 */

exports.unfollowPlaylist = async (playlistId, user) => {
  const playlist = await Playlist.findById(playlistId).select('id').lean();
  if (!playlist) return null;
  await PlaylistFollowings.deleteOne({
    playlistId: playlistId,
    userId: user._id
  });
  return true;
};
