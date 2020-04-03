const { playlistService } = require('../services');
const AppError = require('../utils/AppError');
const multer = require('multer');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}.${file.originalname}`);
  }
});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.match(/(png|jpg|jpeg)/)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Not an image! Please upload only images.',400
      ),
      false
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadImage = upload.single('image');
/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Ahmed Magdy
 * @description get playlist of a specific ID
 * @summary Get Playlist
 */

exports.getPlaylist = async (req, res, next) => {
  if((req.baseUrl).match(/.*users.*/)|| (req.baseUrl).match(/.*me.*/)){
    return next(new AppError('endpoint not found', 404));
  }
  const playlist = await playlistService.getPlaylist(req.params);
  if(!playlist) return next(new AppError('no playlist with such id', 404));
  res.status(200).json(playlist);
}

exports.getImage = async (req, res, next) => {
  if((req.baseUrl).match(/.*users.*/)|| (req.baseUrl).match(/.*me.*/)){
    return next(new AppError('endpoint not found', 404));
  }
  const playlist = await playlistService.getPlaylist(req.params);
  if(!playlist) return next(new AppError('no playlist with such id', 404));
  res.status(200).json(playlist.image);
}


/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Ahmed Magdy
 * @description change playlist's details of a specific ID
 * @summary change Playlist Details
 */


exports.changePlaylist = async(req,res,next) => {
  if((req.baseUrl).match(/.*users.*/) || (req.baseUrl).match(/.*me.*/) ){
    return next(new AppError('not found', 404));
  }
  let image;
  if(!req.file) image = 'uploads\\default.jpg';
  else  image = req.file.path;
  const playlist = await playlistService.changePlaylist(req.params ,req.body, image);
  if(!playlist) return next(new AppError('no playlist with such id', 404));
  res.status(200).json(playlist);
}

/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Ahmed Magdy
 * @description upload an image for a playlist of a specific ID
 * @summary Upload Image
 */

exports.uploadImageRoute  = async (req , res , next)=>{
  if((req.baseUrl).match(/.*users.*/)|| (req.baseUrl).match(/.*me.*/)){
    return next(new AppError('endpoint not found', 404));
  }
  const playlist = await playlistService.uploadImage(req.params ,req.file.path);
  if(!playlist) return next(new AppError('no playlist with such id', 404));
  res.status(200).send('uploaded');
}

/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Ahmed Magdy
 * @description get tracks from a playlist of a specific ID
 * @summary Get tracks
 */

exports.getTracks  = async (req , res , next)=>{
  if((req.baseUrl).match(/.*users.*/)|| (req.baseUrl).match(/.*me.*/)){
    return next(new AppError('endpoint not found', 404));
  }
  const playlist = await playlistService.getTracks(req.params , req.query);
  if(!playlist.tracks) return next(new AppError('no playlist with such id', 404));
  res.status(200).json({
    items:  playlist.tracks,
    offset: req.query.offset,
    limit: req.query.limit,
    total: playlist.total
  });
}

/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Ahmed Magdy
 * @description get playlists of a specific id 
 * @summary get playlists
 */

exports.getUserPlaylists = async(req , res , next)=>{
  if(req.baseUrl == '/api/v1/playlists'){
    return next(new AppError('not found', 404));
  }
  let params;
  if((req.baseUrl).match(/.*users.*/) ){
    params = req.params.id; 
  }
  else {
    params = req.user.id;
  }
  const user = await playlistService.checkUser(params);
  if(!user) return next(new AppError('no user with this id', 404));
  const playlists = await playlistService.getUserPlaylists(req.params , req.query);
  res.status(200).json({
    items:  playlists.playlists,
    offset: req.query.offset,
    limit: req.query.limit,
    total: playlists.total
  });
}

/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Ahmed Magdy
 * @description create a playlist 
 * @summary create a playlist
 */

exports.createUserPlaylist = async(req , res , next)=>{
  if(req.baseUrl == '/api/v1/playlists' || (req.baseUrl).match(/.*users.*/) ){
    return next(new AppError('not found', 404));
  }
  let image;
  if(!req.file) image = 'uploads\\default.jpg';
  else  image = req.file.path;
  const user = await playlistService.checkUser(req.params);
  if(!user) return next(new AppError('no user with this id', 404));
  const playlist = await playlistService.createUserPlaylist(req.params , req.body, image);
  res.status(200).send(playlist);
}

/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Ahmed Magdy
 * @description delete tracks in playlist of a specific id
 * @summary delete tracks
 */

exports.deleteTracks = async(req , res , next)=>{
  if((req.baseUrl).match(/.*users.*/)|| (req.baseUrl).match(/.*me.*/)){
    return next(new AppError('endpoint not found', 404));
  }
  const tracks = await playlistService.getTracksID(req.body.uris);
  if(!tracks) return next(new AppError('no tracks with these uris', 404));
  const playlist = await playlistService.deleteTracks(req.params ,tracks);
  if(!playlist) return next(new AppError('no playlist with this id', 404));
  res.status(200).send('found tracks from tracks send to be deleted are deleted');
}


exports.addTracks =async(req , res , next)=>{
  if((req.baseUrl).match(/.*users.*/)|| (req.baseUrl).match(/.*me.*/)){
    return next(new AppError('endpoint not found', 404));
  }
  const tracks = await playlistService.getTracksID(req.body.uris);
  if(!tracks) return next(new AppError('no tracks with these uris', 404));
  const playlist = await playlistService.addTracks(req.params , tracks ,req.body.postion);
  if(!playlist) return next(new AppError('no playlist with this id', 404));
  res.status(200).send('found tracks from tracks send to be added are added');
}

exports.replaceTracks = async(req , res , next)=>{
  if((req.baseUrl).match(/.*users.*/)|| (req.baseUrl).match(/.*me.*/)){
    return next(new AppError('endpoint not found', 404));
  }
  const tracks = await playlistService.getTracksID(req.body.uris);
  if(!tracks) return next(new AppError('no tracks with these uris', 404));
  let playlist = await playlistService.getPlaylist(req.params);
  if(!playlist) return next(new AppError('no playlist with such id', 404));
  playlist = await playlistService.deleteTracks(playlist ,tracks);
  playlist = await playlistService.addTracks(req.params , tracks ,0 );
  res.status(200).send('found tracks from tracks send to be added are added');
}

exports.reorderTracks = async(req ,res ,next)=>{
  if((req.baseUrl).match(/.*users.*/)|| (req.baseUrl).match(/.*me.*/)){
    return next(new AppError('endpoint not found', 404));
  }
  let playlist = await playlistService.getPlaylist(req.params);
  if(!playlist) return next(new AppError('no playlist with such id', 404));
  await playlistService.reorderTracks(playlist, req.body);
  res.status(200).send('Tracks has beeb reordered');
}