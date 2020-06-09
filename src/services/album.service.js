const { Album } = require('../models/album.model');
const mongoose = require('mongoose');
const fs = require('fs').promises;
const AppError = require('../utils/AppError');
const _ = require('lodash');

/**
 * A method that gets an album by it's ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary gets an album
 * @param {String} id ID of the album to be retrieved
 * @param {object} user the user object if authenticated
 * @returns album if the album was found
 * @returns null if the album was not found
 */
exports.findAlbum = async (id, user) => {
  let album = Album.findById(id)
    .lean({ virtuals: true })
    .populate('artists', 'displayName images')
    .populate('genres')
    .populate({
      path: 'tracks',
      options: { limit: 50, offset: 0 },
      select: '-album',
      populate: { path: 'artists', select: 'displayName images' }
    })
    .select('-album_group');

  let lengthObj = Album.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(id) } },
    { $project: { tracks: { $size: '$tracks' } } }
  ]);

  [album, lengthObj] = await Promise.all([album, lengthObj]);
  if (album) {
    if (
      !album.released &&
      (!user || String(user._id) !== String(album.artists[0]._id))
    )
      return new AppError(
        "You don't have the permission to perform this action",
        403
      );

    album.tracks = {
      limit: 50,
      offset: 0,
      total: lengthObj[0].tracks,
      items: album.tracks
    };
  } else return new AppError('The request resource is not found', 404);
  return album;
};

/**
 * A method that gets an album by it's ID (helper for other services)
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary gets an album
 * @param {String} id ID of the album to be retrieved
 * @returns album if the album was found
 * @returns null if the album was not found
 */
exports.findAlbumUtil = async id => {
  let album = await Album.findById(id)
    .populate('artists', 'displayName images')
    .populate('genres')
    .populate({
      path: 'tracks',
      options: { limit: 50, offset: 0 },
      select: '-album',
      populate: { path: 'artists', select: 'displayName images' }
    })
    .select('-album_group');
  return album;
};

/**
 * A method that gets array of albums By their ID's
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Get list of albums
 * @param {Array<String>} ids - List of ID's of albums to be retrieved
 * @param {object} user the user object if authenticated
 * @returns {Array} An array containing the albums with nulls against unmatched ID's
 */
exports.findAlbums = async (ids, user) => {
  let result = Album.find({ _id: ids })
    .lean({ virtuals: true })
    .populate('artists', 'displayName images')
    .populate('genres')
    .populate({
      path: 'tracks',
      options: { limit: 50, offset: 0 },
      select: '-album',
      populate: { path: 'artists', select: 'displayName images' }
    })
    .select('-album_group');

  let lengthArray = Album.aggregate([
    { $match: { _id: { $in: ids.map(id => mongoose.Types.ObjectId(id)) } } },
    { $project: { tracks: { $size: '$tracks' } } }
  ]);
  [result, lengthArray] = await Promise.all([result, lengthArray]);
  let length;

  const albums = ids.map(id => {
    let val = result.find(album => String(album._id) == id);
    if (val) {
      if (
        !val.released &&
        (!user || String(user._id) !== String(val.artists[0]._id))
      )
        return null;

      length = lengthArray.find(
        albumTno => String(albumTno._id) === String(id)
      );
      return {
        ...val,
        tracks: {
          limit: 50,
          offset: 0,
          total: length.tracks,
          items: val.tracks
        }
      };
    } else return null;
  });
  return albums;
};

/**
 * A method that deletes an album by it's ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Deletes an album
 * @param {String} id ID of the album to be deleted
 */
exports.deleteAlbum = async id => {
  let album = Album.findByIdAndDelete(id)
    .lean({ virtuals: true })
    .populate('artists', 'displayName images')
    .populate('genres')
    .populate({
      path: 'tracks',
      options: { limit: 50, offset: 0 },
      select: '-album',
      populate: { path: 'artists', select: 'displayName images' }
    })
    .select('-album_group');

  let lengthObj = Album.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(id) } },
    { $project: { tracks: { $size: '$tracks' } } }
  ]);

  [album, lengthObj] = await Promise.all([album, lengthObj]);
  if (album) {
    album.tracks = {
      limit: 50,
      offset: 0,
      total: lengthObj[0].tracks,
      items: album.tracks
    };
  }
  return album;
};

/**
 * A method that gets array of tracks of an album
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Get list of tracks of an album
 * @param {String} id - ID of the album containing the tracks
 * @param {Number} limit The maximum number of tracks to return
 * @param {Nuumber} offset The index of the first track to return starting from 0
 * @param {object} user the user object if authenticated
 * @returns {Array} An array containing the tracks of the album
 * @returns null if the album was not found
 */
exports.findTracksOfAlbum = async (id, limit, offset, user) => {
  let result = Album.findById(id)
    .populate({
      path: 'tracks',
      select: '-album',
      populate: { path: 'artists', select: 'displayName images' },
      options: { limit: limit, skip: offset }
    })
    .select('tracks released artists');

  let lengthObj = Album.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(id) } },
    { $project: { tracks: { $size: '$tracks' } } }
  ]);

  [result, lengthObj] = await Promise.all([result, lengthObj]);
  if (!result) return new AppError('The requested resource is not found', 404);
  if (
    !result.released &&
    (!user || String(user._id) !== String(result.artists[0]._id))
  )
    return new AppError(
      "You don't have the permission to perform this action",
      403
    );
  return [result.tracks, lengthObj[0].tracks];
};

/**
 * A method that updates an album by it's ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary updates an album
 * @param {String} id ID of the album to be updated
 * @param {object} newAlbum object containing the new values
 * @returns Updated album
 */
exports.update = async (id, newAlbum) => {
  let album = Album.findByIdAndUpdate(id, newAlbum, { new: true })
    .lean({ virtuals: true })
    .populate('artists', 'displayName images')
    .populate('genres')
    .populate({
      path: 'tracks',
      select: '-album',
      options: { limit: 50, offset: 0 },
      populate: { path: 'artists', select: 'displayName images' }
    })
    .select('-album_group');

  let lengthObj = Album.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(id) } },
    { $project: { tracks: { $size: '$tracks' } } }
  ]);

  [album, lengthObj] = await Promise.all([album, lengthObj]);
  if (album) {
    album.tracks = {
      limit: 50,
      offset: 0,
      total: lengthObj[0].tracks,
      items: album.tracks
    };
  }
  return album;
};

/**
 * A method that updates the image of an album
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary updates the image of the given album
 * @param {object} album album to be updated
 * @param {string} path the path of the image
 * @returns Updated album
 */
exports.setImage = async (album, path) => {
  path = path.replace(/\\/g, '/');
  album.image = path;

  let lengthObj = Album.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(album._id) } },
    { $project: { tracks: { $size: '$tracks' } } }
  ]);

  [, lengthObj] = await Promise.all([album.save(), lengthObj]);
  album = album.toJSON();
  album.album_group = undefined;
  album.tracks = {
    limit: 50,
    offset: 0,
    total: lengthObj[0].tracks,
    items: album.tracks
  };
  return album;
};

/**
 * A method that creates a new album
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary creates an album
 * @param {object} newAlbum object containing the new values
 * @returns Created album
 */
exports.createAlbum = async newAlbum => {
  let album = await (await Album.create(newAlbum))
    .populate('artists', 'displayName images')
    .populate('genres')
    .execPopulate();

  album = album.toJSON();
  album.album_group = undefined;
  album.tracks = {
    limit: 50,
    offset: 0,
    total: 0,
    items: album.tracks
  };
  return album;
};

/**
 * A method that adds a track to an album
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Adds a track to an album
 * @param {object} album album of the track
 * @param {object} track the track
 * @returns album after update
 */
exports.addTrack = async (album, track) => {
  album.tracks.push(track);
  await album.save();

  let lengthObj = Album.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(album._id) } },
    { $project: { tracks: { $size: '$tracks' } } }
  ]);

  [album, lengthObj] = await Promise.all([
    album
      .populate('artists', 'displayName images')
      .populate('genres')
      .populate({
        path: 'tracks',
        select: '-album',
        options: { limit: 50, offset: 0 },
        populate: { path: 'artists', select: 'displayName images' }
      })
      .execPopulate(),
    lengthObj
  ]);

  album = album.toJSON();
  album.album_group = undefined;
  album.tracks = {
    limit: 50,
    offset: 0,
    total: lengthObj[0].tracks,
    items: album.tracks
  };
  return album;
};

/**
 * A method that returns albums of a specific artist
 *
 * @function
 * @summary Gets albums of an artist
 * @param {String} artistId Id of the artist
 * @param {Number} limit Maximum number of albums to be retrieved
 * @param {Number} offset index of the first album (starting from 0)
 * @param {Array<string>} groups the required album groups
 * @param {object} user
 * @returns {Array<Object>} array of albums of the artist
 * @returns {Number} the length of the array
 * @returns null if the artist has no albums or the ID doesn't belong to any artist
 */
exports.findArtistAlbums = async (artistId, limit, offset, groups, user) => {
  // Initializing some options used in queries
  let types = ['single', 'album', 'compilation'];
  let appears = true;
  let released = [true];
  
  // if the user is the artist, return albums even if they aren't released
  if (user && String(user._id) === String(artistId)) {
    released = [true, false];
  }
  // If groups are specified determine what to use, else use default options
  if (groups) {
    types = groups.filter(group => group !== 'appears_on');
    appears = groups.includes('appears_on');
  }
  // find albums of groups specified by album_type
  let result = Album.find({
    'artists.0': artistId,
    album_type: types,
    released: released
  })
    .populate('artists', '_id displayName images')
    .populate('genres')
    .select('-tracks -genres -release_date')
    .limit(limit)
    .skip(offset);
  // count albums of groups specified by album_type
  let length = Album.countDocuments({
    'artists.0': artistId,
    album_type: types,
    released: released
  });

  // await for both queries simultaneously
  [result, length] = await Promise.all([result, length]);

  // if appears_on group is specified get albums that the requested artist
  // appeared on but not their main artist.
  if (appears) {
    let appearsAlbums;
    
    // New limit & skip is the limit - albums by other groups
    if (limit - result.length !== 0) {
      console.log(offset - length)
      let secondskip = offset - length > 0 ? offset - length : 0;
      
      // query appears_on albums
      appearsAlbums = Album.find({
        $and: [
          { artists: artistId, released: true },
          { 'artists.0': { $ne: artistId } }
        ]
      })
        .populate('artists', '_id displayName images')
        .populate('genres')
        .select('-tracks -genres -release_date')
        .limit(limit - length)
        .skip(secondskip);
    } 
    // if albums already reached the limit just resolve the promise
    else appearsAlbums = Promise.resolve([]);
    // Count appears on albums
    let appearslength = Album.countDocuments({
      $and: [
        { artists: artistId, released: true },
        { 'artists.0': { $ne: artistId } }
      ]
    });

    // Wait for both simultaneously
    [appearsAlbums, appearslength] = await Promise.all([
      appearsAlbums,
      appearslength
    ]);

    // update the group for each
    appearsAlbums.forEach(album => {
      album.album_group = 'appears_on';
    });

    // concatenate arrays and sum the counts 
    length += appearslength;
    result = result.concat(appearsAlbums);
  }

  // return final list and the total length
  return [result, length];
};

/**
 *  A method that deletes the image with the given path
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Deletes the file of an image
 * @param {String} image path of the file
 */

exports.deleteImage = async image => {
  if (image) {
    try {
      await fs.unlink(image);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
};

/**
 * A method that removes a track from the album tracks list
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Removes a track from tracks list
 * @param {String} albumId ID of the album
 * @param {String} trackId ID of the track
 */

exports.removeTrack = async (albumId, trackId) => {
  await Album.findByIdAndUpdate(albumId, { $pull: { tracks: trackId } });
};

/**
 * A method that releases an album if it has an image and all of its
 * tracks have files. and returns the updated album.
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Releases an album
 * @param {object} album
 * @param {object} user
 * @returns Updated album if successful
 * @returns null if the album didn't match the specifications of released albums
 */
exports.releaseAlbum = async (album, user) => {
  if (album.image) {
    for (let i = 0, n = album.tracks.length; i < n; i++) {
      if (!album.tracks[i].audioUrl)
        return new AppError(
          'All tracks of the album must have files before releasing',
          400
        );
    }
  } else
    return new AppError(
      'An album should have an image before being released',
      400
    );
  if (album.album_type === 'single' && album.tracks.length !== 1)
    return new AppError('Single albums must have exactly one track', 400);

  album.released = true;
  if (user.popularSongs.length < 5)
    user.popularSongs = _.concat(
      user.popularSongs,
      _.slice(album.tracks, 0, 5)
    );

  let lengthObj = Album.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(album._id) } },
    { $project: { tracks: { $size: '$tracks' } } }
  ]);

  [, , album, lengthObj] = await Promise.all([
    album.save(),
    user.save(),
    album
      .populate('artists', 'displayName images')
      .populate('genres')
      .populate({
        path: 'tracks',
        select: '-album',
        options: { limit: 50, offset: 0 },
        populate: { path: 'artists', select: 'displayName images' }
      })
      .execPopulate(),
    lengthObj
  ]);

  album = album.toJSON();
  album.album_group = undefined;
  album.tracks = {
    limit: 50,
    offset: 0,
    total: lengthObj[0].tracks,
    items: album.tracks
  };
  return album;
};

/**
 * A method that gets an album by it's ID with the tracks containing
 * their audioUrl's for the use with releaseAlbum and not to return to
 * the client
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary gets an album
 * @param {String} id ID of the album to be retrieved
 * @returns album if the album was found
 * @returns null if the album was not found
 */
exports.findAlbumPrivate = async id => {
  return await Album.findById(id).populate({
    path: 'tracks',
    select: 'audioUrl'
  });
};
