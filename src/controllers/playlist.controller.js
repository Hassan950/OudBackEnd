const { playlistService } = require('../services');
const AppError = require('../utils/AppError');

/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Ahmed Magdy
 * @description get playlist of a specific ID
 * @summary Get Playlist
 */

exports.getPlaylist = async (req, res, next) => {
  const playlist = await playlistService.getPlaylist(req.params);
  if(!playlist) return next(new AppError('no playlist with such id', 404));
  res.status(200).json({
    playlist: playlist
  });
}

/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Ahmed Magdy
 * @description change playlist's details of a specific ID
 * @summary change Playlist Details
 */


exports.changePlaylist = async(req,res,next) => {
  const playlist = await playlistService.changePlaylist(req.params ,req.body);
  if(!playlist) return next(new AppError('no playlist with such id', 404));
  res.status(200).json({
    playlist: playlist
  });
}

/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Ahmed Magdy
 * @description upload an image for a playlist of a specific ID
 * @summary Upload Image
 */

exports.uploadImage  = async (req , res , next)=>{
  const playlist = await playlistService.uploadImage(req.params , req.body);
  if(!playlist) return next(new AppError('no playlist with such id', 404));
  res.status(200).send(200);
}

/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Ahmed Magdy
 * @description get tracks from a playlist of a specific ID
 * @summary Get tracks
 */

exports.getTracks  = async (req , res , next)=>{
  const playlist = await playlistService.getTracks(req.params , req.query);
  if(!playlist) return next(new AppError('no playlist with such id', 404));
  res.status(200).json({
    playlist: playlist.tracks,
    offset: req.query.offset,
    limit: req.query.limit,
    total: playlist.total
  });
}

