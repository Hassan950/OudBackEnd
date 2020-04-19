const { playlistService } = require('../services');
const AppError = require('../utils/AppError');
const multer = require('multer');


/* istanbul ignore next */
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/playlists');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}.${file.originalname}`);
  }
});

/* istanbul ignore next */
const multerFilter = (req, file, cb) => {
  if (file.mimetype.match(/(png|jpg|jpeg)/)) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

/* istanbul ignore next */
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});


/**
 * calls multer to upload an image that is in req.body.image and put it in req.file
 *
 * @function
 * @author Ahmed Magdy
 * @summary A middleware that uses multer to upload an image
 */
/* istanbul ignore next */
exports.uploadImage = upload.single('image');


/**
 * A middleware that gets the playlist with the given ID
 *
 * @function
 * @author Ahmed Magdy
 * @summary Gets a playlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the playlist doesn't exist or if Url contains users or me
 */

exports.getPlaylist = async (req, res, next) => {
  if (req.baseUrl.match(/.*users.*/) || req.baseUrl.match(/.*me.*/)) {
    return next(new AppError('endpoint not found', 404));
  }
  const playlist = await playlistService.getPlaylist(req.params);
  if (!playlist) return next(new AppError('no playlist with such id', 404));
  res.status(200).json(playlist);
};


/**
 * A middleware that gets the image of a playlist with the given ID
 *
 * @function
 * @author Ahmed Magdy
 * @summary Gets the image of a playlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the playlist doesn't exist or if Url contains users or me
 */

exports.getImage = async (req, res, next) => {
  if (req.baseUrl.match(/.*users.*/) || req.baseUrl.match(/.*me.*/)) {
    return next(new AppError('endpoint not found', 404));
  }
  const playlist = await playlistService.getPlaylist(req.params);
  if (!playlist) return next(new AppError('no playlist with such id', 404));
  res.status(200).json(playlist.image);
};

/**
 * A middleware that changes details of a playlist with the given ID
 *
 * @function
 * @author Ahmed Magdy
 * @summary changes details of a playlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the playlist doesn't exist or if Url contains users or me
 */

exports.changePlaylist = async (req, res, next) => {
  if (req.baseUrl.match(/.*users.*/) || req.baseUrl.match(/.*me.*/)) {
    return next(new AppError('not found', 404));
  }
  let image;
  if (!req.file) image = 'uploads\\playlists\\default.jpg';
  else image = req.file.path;
  const playlist = await playlistService.changePlaylist(
    req.params,
    req.body,
    image
  );
  if (!playlist) return next(new AppError('no playlist with such id', 404));
  res.status(200).json(playlist);
};

/**
 * A middleware that uploads an image to a playlist with the given ID
 *
 * @function
 * @author Ahmed Magdy
 * @summary uploads an image to a playlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the playlist doesn't exist or if Url contains users or me
 */

exports.uploadImageRoute = async (req, res, next) => {
  if (req.baseUrl.match(/.*users.*/) || req.baseUrl.match(/.*me.*/)) {
    return next(new AppError('endpoint not found', 404));
  }
  const playlist = await playlistService.uploadImage(req.params, req.file.path);
  if (!playlist) return next(new AppError('no playlist with such id', 404));
  res.sendStatus(204);
};

/**
 * A middleware that gets the tracks of a playlist if a given Id
 *
 * @function
 * @author Ahmed Magdy
 * @summary Gets tracks of a playlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the playlist doesn't exist or if Url contains users or me
 */

exports.getTracks = async (req, res, next) => {
  if (req.baseUrl.match(/.*users.*/) || req.baseUrl.match(/.*me.*/)) {
    return next(new AppError('endpoint not found', 404));
  }
  const playlist = await playlistService.getTracks(req.params, req.query);
  if (!playlist.tracks)
    return next(new AppError('no playlist with such id', 404));
  res.status(200).json({
    items: playlist.tracks,
    offset: req.query.offset,
    limit: req.query.limit,
    total: playlist.total
  });
};

/**
 * A middleware that gets the playlists that a user follows
 *
 * @function
 * @author Ahmed Magdy
 * @summary Gets followed playlists
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the user doesn't exist or if Url doesont contains users or me
 */

exports.getUserPlaylists = async (req, res, next) => {
  if (req.baseUrl == '/api/v1/playlists') {
    return next(new AppError('not found', 404));
  }
  let params;
  let publicity;
  if (req.baseUrl.match(/.*users.*/)) {
    params = req.params.id;
    const user = await playlistService.checkUser(params);
    if (!user) return next(new AppError('no user with this id', 404));
    publicity = { public: true };
  } else {
    params = req.user.id;
    publicity = {};
  }
  const playlists = await playlistService.getUserPlaylists(
    params,
    req.query,
    publicity
  );
  res.status(200).json({
    items: playlists.playlists,
    offset: req.query.offset,
    limit: req.query.limit,
    total: playlists.total
  });
};

/**
 * A middleware that creates a playlist for a user of the given ID
 *
 * @function
 * @author Ahmed Magdy
 * @summary create playlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the user doesn't exist or if Url doesont contains users 
 */

exports.createUserPlaylist = async (req, res, next) => {
  if (req.baseUrl == '/api/v1/playlists' || req.baseUrl.match(/.*me.*/)) {
    return next(new AppError('not found', 404));
  }
  let image;
  if (!req.file) image = 'uploads\\playlists\\default.jpg';
  else image = req.file.path;
  const user = await playlistService.checkUser(req.params.id);
  if (!user) return next(new AppError('no user with this id', 404));
  const playlist = await playlistService.createUserPlaylist(
    req.params,
    req.body,
    image
  );
  res.status(200).send(playlist);
};

/**
 * A middleware that deletes the tracks with the given Uri in the playlist of given Id
 *
 * @function
 * @author Ahmed Magdy
 * @summary Deletes tracks in playlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the playlist doesn't exist or Url contains me or users or all tracks sent doesnot exists
 */

exports.deleteTracks = async (req, res, next) => {
  if (req.baseUrl.match(/.*users.*/) || req.baseUrl.match(/.*me.*/)) {
    return next(new AppError('endpoint not found', 404));
  }
  const tracks = await playlistService.getTracksId(req.body.ids);
  if (!tracks) return next(new AppError('no tracks with these uris', 404));
  const playlist = await playlistService.deleteTracks(req.params, tracks);
  if (!playlist) return next(new AppError('no playlist with this id', 404));
  res.sendStatus(204);
};

/**
 * A middleware that adds the tracks with the given Uri in the playlist of given Id
 *
 * @function
 * @author Ahmed Magdy
 * @summary adds tracks in playlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the playlist doesn't exist or Url contains me or users or all tracks sent doesnot exists
 */

exports.addTracks = async (req, res, next) => {
  if (req.baseUrl.match(/.*users.*/) || req.baseUrl.match(/.*me.*/)) {
    return next(new AppError('endpoint not found', 404));
  }
  const tracks = await playlistService.getTracksId(req.body.ids);
  if (!tracks) return next(new AppError('no tracks with these uris', 404));
  const playlist = await playlistService.addTracks(
    req.params,
    tracks,
    req.body.position
  );
  if (!playlist) return next(new AppError('no playlist with this id', 404));
  res.sendStatus(204);
};

/**
 * A middleware that replaces the tracks in the playlist of given Id with tracks of given url
 *
 * @function
 * @author Ahmed Magdy
 * @summary replaces tracks in playlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the playlist doesn't exist or Url contains me or users or all tracks sent doesnot exists
 */

exports.replaceTracks = async (req, res, next) => {
  if (req.baseUrl.match(/.*users.*/) || req.baseUrl.match(/.*me.*/)) {
    return next(new AppError('endpoint not found', 404));
  }
  const tracks = await playlistService.getTracksId(req.body.ids);
  if (!tracks) return next(new AppError('no tracks with these ids', 404));
  let playlist = await playlistService.getPlaylist(req.params);
  if (!playlist) return next(new AppError('no playlist with such id', 404));
  playlist = await playlistService.deleteTracks(playlist, playlist.tracks);
  playlist = await playlistService.addTracks(req.params, tracks, 0);
  res.sendStatus(204);
};


/**
 * A middleware that reorder the tracks of a playlist of a given Id
 *
 * @function
 * @author Ahmed Magdy
 * @summary reorder tracks of a playlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws AppError 404 Not found if the playlist doesn't exist or if Url contains users or me
 */

exports.reorderTracks = async (req, res, next) => {
  if (req.baseUrl.match(/.*users.*/) || req.baseUrl.match(/.*me.*/)) {
    return next(new AppError('endpoint not found', 404));
  }
  let playlist = await playlistService.getPlaylist(req.params);
  if (!playlist) return next(new AppError('no playlist with such id', 404));
  await playlistService.reorderTracks(playlist, req.body);
  res.sendStatus(204);
};
