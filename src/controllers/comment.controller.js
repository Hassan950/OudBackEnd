const { commentService } = require('../services');
const AppError = require('../utils/AppError');

/**
 * A middleware that gets comments of a specific album or playlist
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets comments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

exports.getComments = async (req, res, next) => {
  // if the url includes albums then it directs to function that gets comments for album
  if (req.baseUrl.match(/.*albums.*/)) {
    const result = await getAlbumComment(req, res, next);//this function gets comments of album
    res.status(200).json({
      comments: result.comments,
      offset: req.query.offset,
      limit: req.query.limit,
      total: result.total
    });
  }
  else { 
    // if the url doesnot includes albums then it directs to function that gets comments for playlist
    const result = await getPlaylistComment(req, res, next);//this function gets comments of playlist
    res.status(200).json({
      comments: result.comments,
      offset: req.query.offset,
      limit: req.query.limit,
      total: result.total
    });
  }
}

/**
 * A middleware that makes comments to a specific album or playlist by the logged in user
 *
 * @function
 * @author Ahmed Magdy
 * @summary makes comments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

exports.makeComments = async (req, res, next) => {
  Name = await commentService.getUserName(req.user.id);
  // if the url includes albums then it directs to function that makes comment for album
  if (req.baseUrl.match(/.*albums.*/)) {
    const album = await makeAlbumComment(req, res, next, Name);//function that makes comment for album
    if(!album)  return next(new AppError('The album with the given ID was not found.', 404));// if album passed not found so error is thrown
    res.sendStatus(204);
  }
  else { 
    // if the url doesnot include albums then it directs to function that makes comment for playlist
    const playlist = await makePlaylistComment(req, res, next, Name);//function that makes comment for playlist
    if(!playlist) return next(new AppError('The playlist with the given ID was not found.', 404));// if playlist passed not found so error is thrown
    res.sendStatus(204);
  }
}

/**
 * A middleware that gets comments to a specific album 
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets comments for album
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

const getAlbumComment = async (req, res, next) => {
  const comment = await commentService.getAlbumComment(req.params, req.query);//function in service gets comments of album
  return comment ;
}

/**
 * A middleware that gets comments to a specific playlist
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets comments for album
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

const getPlaylistComment = async (req, res, next) => {
  const comment = await commentService.getPlaylistComment(req.params, req.query);//function in service gets comments of playlist
  return comment ;
}

/**
 * A middleware that makes comments to a specific album by logged in user
 *
 * @function
 * @author Ahmed Magdy
 * @summary makes comments for album
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

const makeAlbumComment = async (req, res, next, Name) => {
  const album = await commentService.getAlbum(req.params.id);//function in service gets album
  if(album)  await commentService.makeAlbumComment(req.params, Name, req.body);//if album found then we call function in service that makes comment on album 
  return album;
}

/**
 * A middleware that makes comments to a specific playlist by logged in user
 *
 * @function
 * @author Ahmed Magdy
 * @summary makes comments for playlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

const makePlaylistComment = async (req, res, next, Name) => {
  const playlist = await commentService.getPlaylist(req.params.id);//function in service gets playlist
  if(playlist)  await commentService.makePlaylistComment(req.params, Name ,req.body);//if playlist found then we call function in service that makes comment on playlist
  return playlist;
}
