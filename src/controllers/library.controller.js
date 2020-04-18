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
  const check = await libraryService.checkTracks(req.user,ids);
  res.status(200).json({
    IsFound: check
  });
}

const checkSavedAlbums = async(req ,res,next)=>{
  let ids = req.query.ids.split(',');
  const check = await libraryService.checkAlbums(req.user,ids);
  res.status(200).json({
    IsFound: check
  });
}

exports.get = async(req, res , next)=>{
  if(req.baseUrl.match(/.*tracks.*/))
  {
    getSavedTracks(req, res, next);
  }
  else{
    getSavedAlbums(req, res, next);
  }

}

const getSavedTracks = async(req ,res,next)=>{
  const tracks = await libraryService.getTracks(req.user,req.query);
  res.status(200).json({
    items: tracks
  });
}

const getSavedAlbums = async(req ,res,next)=>{
  let ids = req.query.ids.split(',');
  const albums = await libraryService.getAlbums(req.user,req.query);
  res.status(200).json({
    items: albums
  });
}

exports.put = async(req, res , next)=>{
  if(req.baseUrl.match(/.*tracks.*/))
  {
    saveTracks(req, res, next);
  }
  else{
    saveAlbums(req, res, next);
  }
}

const saveTracks = async(req ,res,next)=>{
  let ids = req.query.ids.split(',');
  await libraryService.saveTracks(req.user,ids);
  res.sendStatus(201);
}

const saveAlbums = async(req ,res,next)=>{
  let ids = req.query.ids.split(',');
  await libraryService.saveAlbums(req.user,ids);
  res.sendStatus(201);
}

exports.delete = async(req, res , next)=>{
  if(req.baseUrl.match(/.*tracks.*/))
  {
    deleteSavedTracks(req, res, next);
  }
  else{
    deleteSavedAlbums(req, res, next);
  }
}

const deleteSavedTracks = async(req,res,next)=>{
  let ids = req.query.ids.split(',');
  await libraryService.deleteSavedTracks(req.user,ids);
  res.sendStatus(204);
}

const deleteSavedAlbums = async(req,res,next)=>{
  let ids = req.query.ids.split(',');
  await libraryService.deleteSavedAlbums(req.user,ids);
  res.sendStatus(204);
}

