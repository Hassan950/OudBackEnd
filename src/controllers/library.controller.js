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
  const check = await libraryService.checkTracks(ids);
  res.status(200).json({
    IsFound: check
  });
}

const checkSavedAlbums = async(req ,res,next)=>{
  let ids = req.query.ids.split(',');
  const check = await libraryService.checkAlbums(ids);
  res.status(200).json({
    IsFound: check
  });
} 