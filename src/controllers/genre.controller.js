const { genreService } = require('..//services');
const AppError = require('../utils/AppError');

exports.getGenre = async (req, res, next) => {
  const genre = await genreService.findGenre(req.params.id);
  if (!genre)
    return next(new AppError('The requested resource was not found', 404));

  res.status(200).json(genre);
};

exports.getGenres = async (req, res, next) => {
  const genres = await genreService.findGenres(
    req.query.limit,
    req.query.offset
  );
  if (!genres) return next(new AppError('There are no genres', 500));
  res.status(200).json({
    offset: req.query.offset,
    limit: req.query.limit,
    total: genres[1],
    items: genres[0]
  });
};
