const { Artist, User } = require('../models');
const mongoose = require('mongoose');

/**
 * A method that gets an artist by it's ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary gets an artist
 * @param {String} id ID of the artist to be retrieved
 * @returns artist if the artist was found
 * @returns null if the artist was not found
 */
exports.findArtist = async id => {
  const artist = await Artist.findById(id)
    .populate({
      path: 'popularSongs',
      select: '-audioUrl'
    })
    .populate('genres');
  return artist;
};

/**
 * A method that gets an array of artists by their ID's
 *
 * @function
 * @summary Get a list of artists
 * @param {Array<String>} ids - List of ID's of artists to be retrieved
 * @returns {Array} An array containing the artists with nulls against unmatched ID's
 */
exports.findArtists = async ids => {
  const result = await Artist.find({ _id: ids })
    .populate({
      path: 'popularSongs',
      select: '-audioUrl'
    })
    .populate('genres');
  const artists = ids.map(id => {
    return result.find(artist => String(artist._id) === id);
  });
  return artists;
};

/**
 * A method that returns popular songs of a specific artist
 *
 * @function
 * @summary Gets popular songs of an artist
 * @param {String} artistId Id of the artist
 * @returns {Array<Object>} array of popular songs of the artist up to 10
 * @returns null if the artist has no popular songs or the ID doesn't belong to any artist
 */
exports.getPopularSongs = async artistId => {
  const artist = await Artist.findById(artistId)
    .populate('popularSongs')
    .select('popularSongs');
  if (!artist || artist.popularSongs.length === 0) return null;
  return artist.popularSongs;
};

exports.relatedArtists = async artistId => {
  const artist = await Artist.findById(artistId);

  if (!artist) return null;

  const artists = await Artist.find({
    genres: artist.genres
  })
    .limit(20)
    .populate('popularSongs')
    .populate('genres');
  return artists;
};

/**
 * A method that checks if the list of artists exist
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Checks if the list of artists exist
 * @param {Array<ObjectId>} artistsIds ID's to check
 * @returns true if they exist
 * @returns false if they don't exist
 */
exports.artistsExist = async artistIds => {
  const artists = await Artist.find({ _id: artistIds });
  if (artistIds.length !== artists.length) return false;
  return true;
};
