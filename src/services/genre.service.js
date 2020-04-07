const { Genre } = require('../models');

/**
 * A method that gets an genre by it's ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary gets a genre
 * @param {String} id ID of the genre to be retrieved
 * @returns genre if the genre was found
 * @returns null if the genre was not found
 */
exports.findGenre = async id => {
  return await Genre.findById(id);
};

/**
 * A method that returns list of genres
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Returns all genres
 * @param {Number} limit The maximum number of genres to return
 * @param {Number} offset The index of the first genre to return starting from 0
 * @returns Array of genres inside a paging object
 */
exports.findGenres = async (limit, offset) => {
  let genres = Genre.find()
    .limit(limit)
    .skip(offset);
  let length = Genre.countDocuments();
  return await Promise.all([genres, length]);
};

/**
 * A method that checks if the list of genres exist
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Checks if the list of genres exist
 * @param {Array<ObjectId>} genreIds ID's to check
 * @returns true if they exist
 * @returns false if they don't exist
 */
exports.genresExist = async genreIds => {
  const genres = await Genre.find({ _id: genreIds });
  if (genreIds.length !== genres.length) return false;
  return true;
};
