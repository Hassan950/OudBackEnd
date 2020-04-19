const { Playlist, Track, User, PlaylistFollowings } = require('../models');
const _ = require('lodash');
const move = require('lodash-move');
const fs = require('fs');

/**
 * A method that gets a playlist by it's ID
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets a playlist
 * @param {object} params An object containing parameter values parsed from the URL path
 * @returns playlist if the playlist was found
 * @returns null the playlist was not found
 */

exports.getPlaylist = async params => {
  const playlist = await Playlist.findById(params.id).populate('tracks');
  return playlist;
};

/**
 * A method that changes details of playlist by it's ID
 *
 * @function
 * @author Ahmed Magdy
 * @summary change details of a playlist
 * @param {object} params An object containing parameter values parsed from the URL path
 * @param {object} body An object that holds parameters that are sent up from the client in the request
 * @param {string} image new image of playlist
 * @returns playlist if the playlist was found
 * @returns null the playlist was not found
 */

exports.changePlaylist = async (params, body, image) => {
  let playlist = await Playlist.findByIdAndUpdate(
    params.id,
    {
      $set: {
        name: body.name,
        collabrative: body.collabrative,
        description: body.description,
        public: body.public
      }
    },
    { new: true }
  );
  if (!playlist) return playlist;
  if (!image) return playlist;
  const path = playlist.image;
  if (path != image && path != 'uploads\\playlists\\default.jpg') {
    fs.unlink(`${path}`, err => {
      if (err) throw err;
    });
  }
  playlist = await Playlist.findByIdAndUpdate(
    params.id,
    {
      image: image
    },
    { new: true }
  ).populate('tracks');
  return playlist;
};

/**
 * A method that upload new image of playlist by it's ID
 *
 * @function
 * @author Ahmed Magdy
 * @summary upload new image of a playlist
 * @param {object} params An object containing parameter values parsed from the URL path
 * @param {string} image new image of playlist
 * @returns playlist if the playlist was found
 * @returns null the playlist was not found
 */

exports.uploadImage = async (params, image) => {
  let playlist = await Playlist.findById(params.id);
  if (!playlist) return playlist;
  const path = playlist.image;
  if (path != image && path != 'uploads\\playlist\\default.jpg') {
    fs.unlink(`${path}`, err => {
      if (err) throw err;
    });
  }
  playlist.image = image;
  await playlist.save();
  return playlist;
};

/**
 * A method that get Tracks of playlist by it's ID
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets tracks of a playlist
 * @param {object} params An object containing parameter values parsed from the URL path
 * @param {object} query An object containing the URL query parameters
 * @returns {object} contains array of tracks and total of tracks found if the playlist was found
 * @returns null and total of zero if the playlist was not found
 */

exports.getTracks = async (params, query) => {
  const playlist = await Playlist.findById(params.id);
  if (!playlist) {
    const total = 0;
    const tracks = null;
    return { tracks, total };
  }
  const trackPromise = Track.find({ _id: { $in: playlist.tracks } })
    .skip(query.offset)
    .limit(query.limit)
    .exec();
  const totalPromise = Track.countDocuments({
    _id: { $in: playlist.tracks }
  }).exec();
  const [tracks, total] = await Promise.all([trackPromise, totalPromise]);
  return { tracks, total };
};


/**
 * A method that get Followedplaylists of a user 
 *
 * @function
 * @author Ahmed Magdy
 * @summary get Followedplaylists of a user
 * @param {string} id id of the User
 * @param {object} query An object containing the URL query parameters
 * @param {object} publicity shows the publicity of playlist followings
 * @returns {object} contains array of playlists and total of playlists found if the user was found
 * @returns null and total of zero if the user was not found
 */

exports.getUserPlaylists = async (id, query, publicity) => {
  const playlistPromise = PlaylistFollowings.find({ userId: id })
    .where(publicity)
    .populate('playlistId')
    .select('playlistId')
    .select('-_id')
    .skip(query.offset)
    .limit(query.limit)
    .exec();
  let totalPromise;
  if (publicity.public) {
    totalPromise = PlaylistFollowings.countDocuments({
      userId: id,
      public: true
    }).exec();
  } else {
    totalPromise = PlaylistFollowings.countDocuments({ userId: id }).exec();
  }
  let [playlists, total] = await Promise.all([playlistPromise, totalPromise]); 
  playlists = _.map(playlists, playlist => {
    return playlist.playlistId;
  });
  return { playlists, total };
};


/**
 * A method that get tracks of a given urls and its helping to other functions  
 *
 * @function
 * @author Ahmed Magdy
 * @summary get tracks 
 * @param {array} uris array of uris
 * @returns {array} array of tracks if the tracks was found
 * @returns null if the tracks was not found
 */

exports.getTracksId = async Ids => {
  const tracks = await Track.find({ _id: { $in: Ids } });
  return tracks;
};


/**
 * A method that get tracks of a given urls and its helping to other functions  
 *
 * @function
 * @author Ahmed Magdy
 * @summary get user 
 * @param {string} id id of user
 * @returns user if the user was found
 * @returns null if the user was not found
 */

exports.checkUser = async id => {
  const user = await User.findById(id);
  return user;
};

/**
 * A method that create playlist 
 *
 * @function
 * @author Ahmed Magdy
 * @summary Creates a playlist
 * @param {object} params An object containing parameter values parsed from the URL path
 * @param {object} body An object that holds parameters that are sent up from the client in the request
 * @param {string} image new image of playlist
 * @returns playlist 
 */


exports.createUserPlaylist = async (params, body, image) => {
  const playlist = await Playlist.create({
    name: body.name,
    public: body.public,
    collabrative: body.collabrative,
    description: body.description,
    owner: params.id,
    image: image
  });
  return playlist;
};


/**
 * A method that deletes tracks in a playlist 
 *
 * @function
 * @author Ahmed Magdy
 * @summary deletes tracks of a playlist
 * @param {object} params An object containing parameter values parsed from the URL path
 * @param {array} tracks tracks to be deleted
 * @returns playlist if playlist found
 * @returns null if playlist found
 */

exports.deleteTracks = async (params, tracks) => {
  playlist = await Playlist.findByIdAndUpdate(
    params.id,
    { $pull: { tracks: { $in: tracks } } },
    { new: true }
  );
  return playlist;
};

/**
 * A method that adds tracks in a playlist 
 *
 * @function
 * @author Ahmed Magdy
 * @summary adds tracks to a playlist
 * @param {object} params An object containing parameter values parsed from the URL path
 * @param {array} tracks tracks to be added
 * @param {number} position index that the tracks will be added at
 * @returns playlist if playlist found
 * @returns null if playlist found
 */

exports.addTracks = async (params, tracks, position) => {
  let playlist = await Playlist.findById(params.id);
  if (!playlist) return playlist;
  const notFound = [];
  tracks.forEach(element => {
    if (!playlist.tracks.includes(element.id)) {
      notFound.push(element);
    }
  });
  playlist = await Playlist.findByIdAndUpdate(
    params.id,
    {
      $push: {
        tracks: {
          $each: notFound,
          $position: position
        }
      }
    },
    {
      new: true
    }
  );
  return playlist;
};

/**
 * A method that reorder tracks in a playlist 
 *
 * @function
 * @author Ahmed Magdy
 * @summary reorder tracks in a playlist
 * @param {object} params An object containing parameter values parsed from the URL path
 * @param {object} body An object that holds parameters that are sent up from the client in the request
 */

exports.reorderTracks = async (params, body) => {
  const playlist = await Playlist.findOne({ _id: params.id });
  let begin = body.rangeStart;
  let before = body.insertBefore;
  _.times(body.rangeLength, () => {
    playlist.tracks = move.default(playlist.tracks, begin, before);
    before++;
    begin++;
  });
  await playlist.save();
};
