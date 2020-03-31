const { Artist } = require('../models');

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
      options: { limit: 20 },
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
      options: { limit: 20 },
      select: '-audioUrl'
    })
    .populate('genres');
  const artists = ids.map(id => {
    return result.find(artist => String(artist._id) === id);
  });
  return artists;
};
