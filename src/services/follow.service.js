const {
  Followings,
  PlaylistFollowings,
  User,
  Artist,
  Playlist
} = require('../models');
const AppError = require('../utils/AppError');
const _ = require('lodash');

const getFollowedUsers = async (query, user) => {
  const followings = await Followings.find({
    userId: user._id,
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

const getFollowedArtists = async (query, user) => {
  const followings = await Followings.find({
    userId: user._id,
    type: query.type
  })
    .select('-_id')
    .populate({
      path: 'followedId',
      populate: { path: 'user', select: 'displayName images' },
      select: 'user'
    })
    .skip(query.offset)
    .limit(query.limit);
  return _.map(followings, following => {
    const followedId = following.followedId;
    return {
      _id: followedId._id,
      displayName: followedId.user.displayName,
      type: followedId.type,
      images: followedId.user.images
    };
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
 * A function to Get the current user’s followed artists/users.
 *
 * @function
 * @author Hassan Mohamed
 * @summary Get the current user’s followed artists/users.
 * @param {Object} query - The query parameters of the request
 * @param {Object} user - The user object.
 * @returns {Object} Contains the resultant list and the total count of the documents
 */

exports.getUserFollowed = async (query, user) => {
  const resultPromise =
    query.type === 'Artist'
      ? getFollowedArtists(query, user)
      : getFollowedUsers(query, user);

  const totalPromise = Followings.countDocuments({
    userId: user._id,
    type: query.type
  }).exec();
  const [result, total] = await Promise.all([resultPromise, totalPromise]);
  return { result, total };
};

exports.getUserFollowers = async (query, user) => {
  const followings = await Followings.find({
    followedId: user._id
  })
    .select('-_id')
    .populate({ path: 'userId', select: 'displayName images verified' })
    .skip(query.offset)
    .limit(query.limit);
  const resultPromise = _.map(followings, following => {
    return following.userId;
  });
  const totalPromise = Followings.countDocuments({
    followedId: user._id
  }).exec();
  const [result, total] = await Promise.all([resultPromise, totalPromise]);
  return { result, total };
};

exports.followUser = async (ids, type, user) => {
  let users;
  if (type === 'Artist') {
    users = await Artist.find({ _id: ids });
  } else {
    users = await User.find({ _id: ids });
  }
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

exports.unfollowUser = async (ids, type, user) => {
  let users;
  if (type === 'Artist') {
    users = await Artist.find({ _id: ids });
  } else {
    users = await User.find({ _id: ids });
  }
  if (users.length < ids.length) {
    return null;
  }
  const promises = [];
  _.map(users, followed => {
    promises.push(
      Followings.deleteOne({
        userId: user._id,
        followedId: followed,
        type: type
      }).exec()
    );
  });
  await Promise.all(promises);
  return true;
};

exports.followPlaylist = async (playlistId, publicity, user) => {
  playlist = await Playlist.findById(playlistId).select('id');
  if (!playlist) return null;
  await PlaylistFollowings.create({
    playlistId: playlistId,
    userId: user._id,
    public: publicity
  });
  return true;
};

exports.unfollowPlaylist = async (playlistId, user) => {
  playlist = await Playlist.findById(playlistId).select('id');
  if (!playlist) return null;
  await PlaylistFollowings.deleteOne({
    playlistId: playlistId,
    userId: user._id
  });
  return true;
};
