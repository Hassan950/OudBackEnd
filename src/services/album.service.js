const { Album } = require('../models/album.model');
const mongoose = require('mongoose');
const fs = require('fs').promises;

/**
 * A method that gets an album by it's ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary gets an album
 * @param {String} id ID of the album to be retrieved
 * @returns album if the album was found
 * @returns null if the album was not found
 */
exports.findAlbum = async id => {
  let album = Album.findById(id)
    .populate('artists', 'name images')
    .populate('genres')
    .populate({
      path: 'tracks',
      options: { limit: 50, offset: 0 },
      select: '-album',
      populate: { path: 'artists', select: 'name images' }
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
    .populate('artists', 'name images')
    .populate('genres')
    .populate({
      path: 'tracks',
      options: { limit: 50, offset: 0 },
      select: '-album',
      populate: { path: 'artists', select: 'name images' }
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
 * @returns {Array} An array containing the albums with nulls against unmatched ID's
 */
exports.findAlbums = async ids => {
  let result = Album.find({ _id: ids })
    .populate('artists', 'name images')
    .populate('genres')
    .populate({
      path: 'tracks',
      options: { limit: 50, offset: 0 },
      select: '-album',
      populate: { path: 'artists', select: 'name images' }
    })
    .select('-album_group');

  let lengthArray = Album.aggregate([
    { $match: { _id: { $in: ids.map(id => mongoose.Types.ObjectId(id)) } } },
    { $project: { tracks: { $size: '$tracks' } } }
  ]);
  [result, lengthArray] = await Promise.all([result, lengthArray]);
  let length;

  const albums = [];
  for (let i = 0, n = ids.length; i < n; i++) {
    const val = result.find(album => String(album._id) === ids[i]);
    if (val) {
      length = lengthArray.find(albumTno => String(albumTno._id) === ids[i]);
      val.tracks = {
        limit: 50,
        offset: 0,
        total: length.tracks,
        items: val.tracks
      };
      albums[i] = val;
    } else {
      albums[i] = null;
    }
  }
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
    .populate('artists', 'name images')
    .populate('genres')
    .populate({
      path: 'tracks',
      options: { limit: 50, offset: 0 },
      select: '-album',
      populate: { path: 'artists', select: 'name images' }
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
 * @returns {Array} An array containing the tracks of the album
 * @returns null if the album was not found or has no tracks
 */
exports.findTracksOfAlbum = async (id, limit, offset) => {
  let result = Album.findById(id)
    .populate({
      path: 'tracks',
      select: '-album',
      populate: { path: 'artists', select: 'name images' },
      options: { limit: limit, skip: offset }
    })
    .select('tracks');

  let lengthObj = Album.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(id) } },
    { $project: { tracks: { $size: '$tracks' } } }
  ]);

  [result, lengthObj] = await Promise.all([result, lengthObj]);
  if (!result || result.tracks.length == 0) return null;
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
    .populate('artists', 'name images')
    .populate('genres')
    .populate({
      path: 'tracks',
      select: '-album',
      options: { limit: 50, offset: 0 },
      populate: { path: 'artists', select: 'name images' }
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
  album.image = path;

  let lengthObj = Album.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(album._id) } },
    { $project: { tracks: { $size: '$tracks' } } }
  ]);

  [, lengthObj] = await Promise.all([album.save(), lengthObj]);
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
  return await (await Album.create(newAlbum))
    .populate('artists', 'name images')
    .populate('genres')
    .execPopulate();
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
      .populate('artists', 'name images')
      .populate('genres')
      .populate({
        path: 'tracks',
        select: '-album',
        options: { limit: 50, offset: 0 },
        populate: { path: 'artists', select: 'name images' }
      })
      .execPopulate(),
    lengthObj
  ]);

  album.tracks = {
    limit: 50,
    offset: 0,
    total: lengthObj[0].tracks,
    items: album.tracks
  };
  return album;
};

/**
 * A method that deletes the image with the given path
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Deletes the file of an image
 * @param {String} image path of the file
 */

exports.deleteImage = async image => {
  if (image !== 'default.jpg') {
    try {
      await fs.unlink(image);
    } catch (err) {
      console.log(err.message);
    }
  }
};
