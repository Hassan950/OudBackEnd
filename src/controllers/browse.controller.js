const { browseService } = require('../services');
const AppError = require('../utils/AppError');

/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Ahmed Magdy
 * @description returns list of categories with 200 status code
 *  if valid else return error with 400 status code
 * @summary Get categories
 */
exports.getCategories = async (req, res, next) => {
  const categories = await browseService.findCategories(req.query);
  res.status(200).json({
    categories: {
      items: categories.categories,
      offset: req.query.offset,
      limit: req.query.limit,
      total: categories.total
    }
  });
};

/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Ahmed Magdy
 * @description returns Category of a specific ID with 200 status code
 *  if valid else return error with 400 status code
 * @summary Get a category
 */

exports.getCategory = async (req, res, next) => {
  const category = await browseService.findCategory(req.params);
  if (!category)
    return next(
      new AppError('The category with the given ID was not found.', 404)
    );
  res.status(200).json({
    category: category
  });
};

/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Ahmed Magdy
 * @description returns playlists of a Category of a specific ID with 200 status code
 *  if valid else return error with 400 status code
 * @summary Get a category playlists
 */

exports.categoryPlaylists = async (req, res, next) => {
  const categoryPlaylists = await browseService.getPlaylists(
    req.params,
    req.query
  );
  if (!categoryPlaylists.playlists)
    return next(
      new AppError('The category with the given ID was not found.', 404)
    );
  res.status(200).json({
    playlists: {
      items: categoryPlaylists.playlists,
      offset: req.query.offset,
      limit: req.query.limit,
      total: categoryPlaylists.total
    }
  });
};

/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Ahmed Magdy
 * @description returns new albums with 200 status code
 *  if valid else return error with 400 status code
 * @summary new releases
 */

exports.newReleases = async (req, res, next) => {
  const albums = await browseService.getNewReleases(req.query);
  res.status(200).json({
    albums: {
      items: albums.albums,
      offset: req.query.offset,
      limit: req.query.limit,
      total: albums.total
    }
  });
};
