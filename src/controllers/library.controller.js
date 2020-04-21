const { libraryService } = require('../services');
const AppError = require('../utils/AppError');


/**
 * A middleware that directs to the function that checks for the sent tracks or albums ids are they liked by this user or not
 *
 * @function
 * @author Ahmed Magdy
 * @summary directs to another function that checks if the passed tracks or albums are liked by this user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

exports.likedOrNot = async(req, res , next)=>{
  // if the url includes tracks then it directs to function that checks saved tracks
  if(req.baseUrl.match(/.*tracks.*/))
  {
    //function returns array of boolean true if the track is liked or false if track isnot liked by user
    const check = await checkSavedTracks(req, res, next);
    res.status(200).send(check);
  }
  else
  {
    // if the url includes albums then it directs to function that checks saved albums
    //function returns array of boolean true if the album is liked or false if album isnot liked by user
    const check = await checkSavedAlbums(req, res, next);
    res.status(200).send(check);
  }
}


/**
 * A middleware that checks if the passed tracks are liked by the logged in user
 *
 * @function
 * @author Ahmed Magdy
 * @summary checks if the passed tracks are liked by the logged in user or not
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

const checkSavedTracks = async(req ,res,next)=>{
  //sent the logged in user and the passed ids to this function to check if its liked or not
  const check = await libraryService.checkTracks(req.user,req.query.ids);
  return check;
}

/**
 * A middleware that checks if the passed albums are liked by the logged in user
 *
 * @function
 * @author Ahmed Magdy
 * @summary checks if the passed albums are liked by the logged in user or not
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

const checkSavedAlbums = async(req ,res,next)=>{
  //sent the logged in user and the passed ids to this function to check if its liked or not
  const check = await libraryService.checkAlbums(req.user,ids);
  return check;
}

/**
 * A middleware that directs to function to get liked tracks or liked albums of the logged in user
 *
 * @function
 * @author Ahmed Magdy
 * @summary directs to function to get liked tracks or liked albums of the logged in user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */


exports.getLikedItems = async(req, res , next)=>{
  // if the url includes tracks then it directs to function that gets liked tracks
  if(req.baseUrl.match(/.*tracks.*/))
  {
    //function returns array of liked tracks by the logged in user 
    const tracks = await getSavedTracks(req, res, next);
    res.status(200).json({
      items: tracks.tracks,
      offset: req.query.offset,
      limit: req.query.limit,
      total: tracks.total
    });
  }
  else{
    // if the url includes albums then it directs to function that gets liked albums
    //function returns array of liked albums by the logged in user
    const albums = await getSavedAlbums(req, res, next);
    res.status(200).json({
      items: albums.albums,
      offset: req.query.offset,
      limit: req.query.limit,
      total: albums.total
    });
  }

}

/**
 * A middleware that gets liked tracks of the logged in user
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets liked tracks of the logged in user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

const getSavedTracks = async(req ,res,next)=>{
  //sent the logged in user and the query parameters to this function to get the liked tracks by the logged in user
  const tracks = await libraryService.getTracks(req.user,req.query);
  return tracks;
}

/**
 * A middleware that gets liked albums of the logged in user
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets liked albums of the logged in user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

const getSavedAlbums = async(req ,res,next)=>{
  //sent the logged in user and the query parameters to this function to get the liked albumss by the logged in user
  const albums = await libraryService.getAlbums(req.user,req.query);
  return albums;
}

/**
 * A middleware that directs to function to like tracks or like albums of the logged in user
 *
 * @function
 * @author Ahmed Magdy
 * @summary directs to function to like tracks or like albums of the logged in user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

exports.likeItems = async(req, res , next)=>{
  // if the url includes tracks then it directs to function that likes tracks
  if(req.baseUrl.match(/.*tracks.*/))
  {
    //function allows user to like tracks
    saveTracks(req, res, next);
    res.sendStatus(201);
  }
  else{
    // if the url includes albums then it directs to function that likes albums
    //function allows user to like albums
    saveAlbums(req, res, next);
    res.sendStatus(201);
  }
}

/**
 * A middleware that likes tracks by the logged in user
 *
 * @function
 * @author Ahmed Magdy
 * @summary likes tracks by the logged in user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

const saveTracks = async(req ,res,next)=>{
  //ids sent in query as a comma separated ids so i put them in a regular array
  //let ids = req.query.ids.split(',');
  // calls this functions which makes the action to user to like tracks
  await libraryService.saveTracks(req.user,req.query.ids);
}

/**
 * A middleware that likes albums by the logged in user
 *
 * @function
 * @author Ahmed Magdy
 * @summary likes albums by the logged in user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

const saveAlbums = async(req ,res,next)=>{
  //ids sent in query as a comma separated ids so i put them in a regular array
  let ids = req.query.ids.split(',');
  // calls this functions which makes the action to user to like albums
  await libraryService.saveAlbums(req.user,ids);
}

/**
 * A middleware that directs to function to delete liked tracks or delete liked albums of the logged in user
 *
 * @function
 * @author Ahmed Magdy
 * @summary directs to function to delete liked tracks or delete liked albums of the logged in user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.unlikeItems = async(req, res , next)=>{
  // if the url includes tracks then it directs to function that deletes liked tracks
  if(req.baseUrl.match(/.*tracks.*/))
  {
    //function allows user to delete liked tracks
    deleteSavedTracks(req, res, next);
    res.sendStatus(204);
  }
  else{
    // if the url includes tracks then it directs to function that deletes liked albums
    //function allows user to delete liked albums
    deleteSavedAlbums(req, res, next);
    res.sendStatus(204);
  }
}

/**
 * A middleware that allows user to unlike tracks 
 *
 * @function
 * @author Ahmed Magdy
 * @summary allows user to unlike tracks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteSavedTracks = async(req,res,next)=>{
  // calls this functions which makes the action to user to unlike tracks
  await libraryService.deleteSavedTracks(req.user,req.query.ids);
}

/**
 * A middleware that allows user to unlike tracks 
 *
 * @function
 * @author Ahmed Magdy
 * @summary allows user to unlike albums
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

const deleteSavedAlbums = async(req,res,next)=>{
  // calls this functions which makes the action to user to unlike albums
  await libraryService.deleteSavedAlbums(req.user,req.query.ids);
}

