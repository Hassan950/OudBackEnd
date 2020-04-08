const { libraryService } = require('../services');
const AppError = require('../utils/AppError');


exports.check = async(req, res , next)=>{
  if(req.baseUrl.match(/.*tracks.*/))
  {
    checkSavedTracks(req, res, next);
  }
  else{
    checkSavedAlbums(req, res, next);
  }

}

const checkSavedTracks = async(req ,res,next)=>{
  let ids = req.query.ids.split(',');
  const tracks = await libraryService.findTracks(ids);
  res.status(200).json({
    tracks: tracks
  });
}

const checkSavedAlbums = async(req ,res,next)=>{
  let ids = req.query.ids.split(',');
  const albums = await libraryService.findAlbums(ids);
  res.status(200).json({
    albums: albums
  });
} 