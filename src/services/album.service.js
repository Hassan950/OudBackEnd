const { Album } = require('../models/album.model');

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
  let album = await Album.findById(id)
    .populate('artists', '_id name images')
    .populate('genres')
    .populate({
      path: 'tracks',
      options: { limit: 20 },
      select: '-audioUrl'
    })
    .select('-album_group');
  if (album) {
    album.tracks = {
      limit: 20,
      offset: 0,
      total: album.tracks.length,
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
    .populate('artists', '_id name images')
    .populate('genres')
    .populate({
      path: 'tracks',
      options: { limit: 20 },
      select: '-audioUrl'
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
  const result = await Album.find({ _id: ids })
    .populate('artists', '_id name images')
    .populate('genres')
    .populate({
      path: 'tracks',
      options: { limit: 50 },
      select: '-audioUrl'
    })
    .select('-album_group');

  const albums = [];
  for (let i = 0, n = ids.length; i < n; i++) {
    const val = result.find(album => String(album._id) === ids[i]);
    if (val) {
      val.tracks = {
        limit: 20,
        offset: 0,
        total: val.tracks.length,
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
  let album = await Album.findByIdAndDelete(id)
  .populate('artists', '_id name images')
    .populate('genres')
    .populate({
      path: 'tracks',
      options: { limit: 20 },
      select: '-audioUrl'
    })
    .select('-album_group');
  if (album) {
    album.tracks = {
      limit: 20,
      offset: 0,
      total: album.tracks.length,
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
 * @returns {Array} An array containing the tracks of the album
 * @returns null if the album was not found or has no tracks
 */
exports.findTracksOfAlbum = async (id, limit, offset) => {
  const result = await Album.findById(id)
    .populate({
      path: 'tracks',
      options: { limit: limit, skip: offset },
      select: '-audioUrl -album',
      populate: { path: 'artists' }
    })
    .select('tracks');
  if (!result || result.tracks.length == 0) return null;
  return result.tracks;
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
  let album = await Album.findByIdAndUpdate(id, newAlbum, { new: true })
    .populate('artists', '_id name images')
    .populate('genres')
    .populate({
      path: 'tracks',
      options: { limit: 50 },
      select: '-audioUrl'
    })
    .select('-album_group');

  album.tracks = {
    limit: 20,
    offset: 0,
    total: album.tracks.length,
    items: album.tracks
  };
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
  await album.save();
  album.tracks = {
    limit: 20,
    offset: 0,
    total: album.tracks.length,
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
    .populate('artists', '_id name images')
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
  return await album
    .populate('artists', '_id name images')
    .populate('genres')
    .populate({
      path: 'tracks',
      select: '-audioUrl -album'
    })
    .execPopulate();
};
