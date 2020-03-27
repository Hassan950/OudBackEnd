const { playerService, deviceService } = require('../services');
const AppError = require('../utils/AppError.js');

/**
 * @version 1.0.0
 * @throws AppError 500 status
 * @author Abdelrahman Tarek
 * @description get user`s player
 * @summary User player
 */
exports.getPlayer = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Must Authenticate user', 500));
  }

  const id = req.user._id;

  const player = await playerService.getPlayer(id);

  if (!player) {
    res.status(204);
    return res.end();
  }

  res.status(200).json({
    player: player
  });
};


/**
 * @version 1.0.0
 * @throws AppError 500 status
 * @author Abdelrahman Tarek
 * @description get user`s currently playing track
 * @summary User Currently Playing track
 */
exports.getCurrentlyPlaying = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Must Authenticate user', 500));
  }

  const id = req.user._id;

  const currentlyPlaying = await playerService.getCurrentlyPlaying(id);

  if (!currentlyPlaying) {
    res.status(204);
    return res.end();
  }

  res.status(200).json({
    track: currentlyPlaying.item,
    context: currentlyPlaying.context
  })
};

/**
 * @version 1.0.0
 * @throws AppError 500 status
 * @throws AppError 404 status
 * @author Abdelrahman Tarek
 * @description change isPlaying to false
 * @summary Pause the player
 */
exports.pausePlayer = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Must Authenticate user', 500));
  }

  const id = req.user._id;

  const deviceId = req.query.deviceId;

  const player = await playerService.getPlayer(id, { populate: false });

  if (!player) {
    return next(new AppError('Player is not found', 404));
  }

  player.isPlaying = false;

  if (deviceId) {
    const device = await deviceService.getDevice(deviceId);
    if (!device) {
      return next(new AppError('Device is not found', 404));
    }
    player.device = deviceId;
  }

  await player.save();

  res.status(204).end();
};


/**
 * @version 1.0.0
 * @throws AppError 500 status
 * @throws AppError 404 status
 * @author Abdelrahman Tarek
 * @description start or resume the player, change deviceId, change isPlaying state to true
 * add tracks to queue, change positionMs
 * @summary Resume the player
 */
exports.resumePlayer = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Must Authenticate user', 500));
  }

  const { contextUri, uris, offset, positionMs } = req.body;

  const id = req.user._id;

  const deviceId = req.query.deviceId;
  // TODO
  // get player
  const player = await playerService.getPlayer(id, { populate: false });

  if (!player) {
    return next(new AppError('Player is not found', 404));
  }
  // Change player state
  player.isPlaying = true;
  // handle deviceId
  if (deviceId) {
    const device = await deviceService.getDevice(deviceId);
    if (!device) {
      return next(new AppError('Device is not found', 404));
    }
    player.device = deviceId;
  }
  // handle Queue
  // add current track
  if (uris && uris.length) {
    const trackId = uris[0].split(':')[2];
    // check if track is valid (add it when track is done)
    player.item = trackId;
    player.positionMs = 0;
  }
  // add tracks to queue
  // change position
  if (positionMs) player.positionMs = positionMs;
  // if position > track duration go to next
  // save
  await player.save();
  // return 204
  res.status(204).end();
};


/**
 * @version 1.0.0
 * @throws AppError 500 status
 * @throws AppError 404 status
 * @author Abdelrahman Tarek
 * @description Seek to positionMs
 * @summary Seek the player
 */
exports.seekPlayer = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Must Authenticate user', 500));
  }

  const { positionMs, deviceId } = req.query;

  const id = req.user._id;

  const player = await playerService.getPlayer(id, { populate: false });

  if (!player) {
    return next(new AppError('Player is not found', 404));
  }

  if (deviceId) {
    const device = await deviceService.getDevice(deviceId);
    if (!device) {
      return next(new AppError('Device is not found', 404));
    }
    player.device = deviceId;
  }

  player.positionMs = positionMs;

  await player.save();

  res.status(204).end();
};