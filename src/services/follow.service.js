const { Followings, PlaylistFollowings, User, Artist, Playlist } = require('../models');
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
  const playlistPromise = Playlist.findById(playlistId).select('public').exec();
  const resultPromise = PlaylistFollowings.find({
    userId: ids,
    playlistId: playlistId
  }).exec();
  const [playlist, result] = await Promise.all([playlistPromise, resultPromise])
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
  let result;
  if (query.type === 'User') {
    result = await Followings.aggregate()
      .match({ userId: user._id, type: 'User' })
      .lookup({
        from: 'users',
        localField: 'followedId',
        foreignField: '_id',
        as: 'user'
      })
      .project({ user: { $arrayElemAt: ['$user', 0] }, _id: 0 })
      .project({
        displayName: '$user.displayName',
        followersCount: '$user.followersCount',
        images: '$user.images',
        verified: '$user.verified',
        _id: '$user._id'
      })
      .skip(query.offset)
      .limit(query.limit);
  } else {
    result = await Followings.aggregate()
      .match({ userId: user._id, type: 'Artist' }) //TODO: change user._id to user.artist._id
      .lookup({
        from: 'artists',
        localField: 'followedId',
        foreignField: '_id',
        as: 'artist'
      })
      .replaceRoot({ $arrayElemAt: ['$artist', 0] })
      .lookup({
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      })
      .project({ user: { $arrayElemAt: ['$user', 0] } })
      .project({
        displayName: '$user.displayName',
        followersCount: '$user.followersCount',
        images: '$user.images'
      })
      .skip(query.offset)
      .limit(query.limit);
  }
  const total = await Followings.countDocuments({
    userId: user._id,
    type: query.type
  });
  return { result, total };
};

const asyncCreate = async (users, id, type) => {
  users.forEach(followed => {
    Followings.create({
      userId: id,
      followedId: followed,
      type: type
    }).catch(() => {});
  });
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
  await asyncCreate(users, user._id, type);
  return true;
};

// exports.followPlaylist = async (playlistId, public) => {};
