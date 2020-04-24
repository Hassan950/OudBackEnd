const { searchService } = require('../services');
const AppError = require('../utils/AppError');


/**
 * A middleware searches for items for the user
 *
 * @function
 * @author Ahmed Magdy
 * @summary searches for items for the user as when the user types anything it returns items that their name matches what he typed 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

exports.search = async(req, res, next) => {
  if (req.baseUrl.match(/.*me.*/)) { // if the BaseUrl contains me then it throws error that this endpoint doesnot exist
    return next(new AppError('endpoint not found', 404));
  }
  // calls a function that makes the search process and returns the items which their names matche the typed string
  const items = await searchService.search(req.query);
  res.status(200).json(items);
};

/**
 * A middleware that adds what user searched for to recently searched
 *
 * @function
 * @author Ahmed Magdy
 * @summary adds what user searched for to recently searched
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.addTORecent = async(req,res,next)=>{
  if (req.baseUrl == "/api/v1/search") {// if the BaseUrl is /api/v1/search then it throws error that this endpoint doesnot exist
    return next(new AppError('endpoint not found', 404));
  }
  // calls a  function which takes what the user searched for and adds it to user's recently searched
  await searchService.addToRecent(req.user,req.body);
  res.sendStatus(200);
}

/**
 * A middleware that gets what user searched for to recently searched
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets what user searched for to recently searched
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

exports.getRecent = async(req,res,next)=>{
  if (req.baseUrl == "/api/v1/search") {// if the BaseUrl is /api/v1/search then it throws error that this endpoint doesnot exist
    return next(new AppError('endpoint not found', 404));
  }
  // calls a fuction that gets what the user recently searched for
  const items = await searchService.getRecent(req.user,req.query);
  res.status(200).json(items);
}