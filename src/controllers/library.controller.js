const { libraryService } = require('../services');
const AppError = require('../utils/AppError');


exports.check = async(req, res , next)=>{
  if(req.baseUrl.match(/.*tracks.*/))
  {
    const check = await checkSavedTracks(req, res, next);
    res.status(200).json({
      isFound: check
    });
  }
  else
  {
    const check = await checkSavedAlbums(req, res, next);
    res.status(200).json({
      isFound: check
    });
  }
}


const checkSavedTracks = async(req ,res,next)=>{
  let ids = req.query.ids.split(',');
  const check = await libraryService.checkTracks(req.user,ids);
  return check;
}

const checkSavedAlbums = async(req ,res,next)=>{
  let ids = req.query.ids.split(',');
  const check = await libraryService.checkAlbums(req.user,ids);
  return check;
}

exports.get = async(req, res , next)=>{
  if(req.baseUrl.match(/.*tracks.*/))
  {
    const tracks = await getSavedTracks(req, res, next);
    res.status(200).json({
      items: tracks
    });
  }
  else{
    const albums = await getSavedAlbums(req, res, next);
    res.status(200).json({
      items: albums
    });
  }

}

const getSavedTracks = async(req ,res,next)=>{
  const tracks = await libraryService.getTracks(req.user,req.query);
  return tracks;
}

const getSavedAlbums = async(req ,res,next)=>{
  const albums = await libraryService.getAlbums(req.user,req.query);
  return albums;
}

exports.put = async(req, res , next)=>{
  if(req.baseUrl.match(/.*tracks.*/))
  {
    saveTracks(req, res, next);
    res.sendStatus(201);
  }
  else{
    saveAlbums(req, res, next);
    res.sendStatus(201);
  }
}

const saveTracks = async(req ,res,next)=>{
  let ids = req.query.ids.split(',');
  await libraryService.saveTracks(req.user,ids);
}

const saveAlbums = async(req ,res,next)=>{
  let ids = req.query.ids.split(',');
  await libraryService.saveAlbums(req.user,ids);
}

exports.delete = async(req, res , next)=>{
  if(req.baseUrl.match(/.*tracks.*/))
  {
    deleteSavedTracks(req, res, next);
    res.sendStatus(204);
  }
  else{
    deleteSavedAlbums(req, res, next);
    res.sendStatus(204);
  }
}

const deleteSavedTracks = async(req,res,next)=>{
  let ids = req.query.ids.split(',');
  await libraryService.deleteSavedTracks(req.user,ids);
}

const deleteSavedAlbums = async(req,res,next)=>{
  let ids = req.query.ids.split(',');
  await libraryService.deleteSavedAlbums(req.user,ids);
}

