const { genreService } = require('..//services');
const AppError = require('../utils/AppError');

/**
 * A middleware that gets the genre with the given ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets a genre
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the genre doesn't exist
 */
exports.getGenre = async (req, res, next) => {
  const genre = await genreService.findGenre(req.params.id);
  if (!genre)
    return next(new AppError('The requested resource was not found', 404));

  res.status(200).json(genre);
};

/**
 * A middleware that gets many genres inside a paging object
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets genres
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 500 Internal server error if there are no genres in the database
 */
exports.getGenres = async (req, res, next) => {
  const genres = await genreService.findGenres(
    req.query.limit,
    req.query.offset
  );
  if (!genres[0]) return next(new AppError('There are no genres', 500));
  res.status(200).json({
    offset: req.query.offset,
    limit: req.query.limit,
    total: genres[1],
    items: genres[0]
  });
};

/**
 * A middleware that gets the artists of the genre with the given ID
 *
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Gets artists of a specific genre
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the genre doesn't exist
 */
exports.getGenreArtists = async (req, res, next) => {
  const artists = await genreService.findGenreArtists(req.params.id);
  if (!artists)
    return next(new AppError('The requested resource was not found', 404));

  res.status(200).json(artists);
};
