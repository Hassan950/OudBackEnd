const { browseService } = require('../services');
const AppError = require('../utils/AppError');

/**
 * A middleware that gets list of Categories
 *
 * @function
 * @author Ahmed Magdy
 * @summary Gets list of categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getCategories = async(req, res, next) => {
	const categories = await browseService.findCategories(req.query);
res.status(200).json({
		items:	categories.categories,
		offset: req.query.offset,
		limit: req.query.limit,
		total: categories.total	
	});
};

/**
 * A middleware that gets the category with the given ID
 *
 * @function
 * @author Ahmed Magdy
 * @summary Gets a category with a specific Id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the category doesn't exist
 */

exports.getCategory = async(req, res, next) => {
	const category = await browseService.findCategory(req.params);
	if (!category) return next(new AppError('The category with the given ID was not found.', 404));
	res.status(200).json(category);
};

/**
 * A middleware that gets the playlist of a category with the given ID
 *
 * @function
 * @author Ahmed Magdy
 * @summary Gets playlists within a category with a specific Id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the category doesn't exist
 */
exports.categoryPlaylists = async(req, res, next) => {
	const categoryPlaylists = await browseService.getPlaylists(req.params, req.query);
	if(!categoryPlaylists.playlists)return next(new AppError('The category with the given ID was not found.', 404));
	res.status(200).json({
		items:	categoryPlaylists.playlists,
		offset: req.query.offset,
		limit: req.query.limit,
		total: categoryPlaylists.total
	});
};

/**
 * A middleware that gets list of  albums that was recently released  
 *
 * @function
 * @author Ahmed Magdy
 * @summary Gets lists of albums that was recently released
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

exports.newReleases = async(req, res, next) => {
	const albums = await browseService.getNewReleases(req.query);
	res.status(200).json({
		items:	albums.albums,
		offset: req.query.offset,
		limit: req.query.limit,
		total: albums.total
	});
};
