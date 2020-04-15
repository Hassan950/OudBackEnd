const { playerService, deviceService, userService, trackService, playHistoryService, queueService } = require('../services');
const AppError = require('../utils/AppError.js');


/**
 * @version 1.0.0
 * @public
 * @async
 * @throws AppError 500 status
 * @author Abdelrahman Tarek
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @description get user`s player
 * @summary User player
 */
exports.getPlayer = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Must Authenticate user', 500));
  }

  const id = req.user._id;

  const link = `${req.protocol}://${req.get(
    'host'
  )}/api/uploads/tracks/`;
  const player = await playerService.getPlayer(id, { link: link, populate: true });

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
 * @public
 * @async
 * @throws AppError 500 status
 * @author Abdelrahman Tarek
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @description get user`s currently playing track
 * @summary User Currently Playing track
 */
exports.getCurrentlyPlaying = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Must Authenticate user', 500));
  }

  const id = req.user._id;

  const link = `${req.protocol}://${req.get(
    'host'
  )}/api/uploads/tracks/`;
  const currentlyPlaying = await playerService.getCurrentlyPlaying(id, { link: link });

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
 * @public
 * @async
 * @throws AppError 500 status
 * @throws AppError 404 status
 * @author Abdelrahman Tarek
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @description change isPlaying to false
 * @summary Pause the player
 */
exports.pausePlayer = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Must Authenticate user', 500));
  }

  const id = req.user._id;

  const deviceId = req.query.deviceId;

  let player = await playerService.getPlayer(id, { populate: false });

  if (!player) {
    return next(new AppError('Player is not found', 404));
  }

  player.isPlaying = false;

  if (deviceId) {
    player = await playerService.addDeviceToPlayer(player, deviceId);
    if (!player)
      return next(new AppError('Device is not found', 404));
  }

  await player.save();

  res.status(204).end();
};


/**
 * @version 1.0.0
 * @public
 * @async
 * @throws AppError 500 status
 * @throws AppError 404 status
 * @author Abdelrahman Tarek
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
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
  // get player and queues
  let [player, queues] = await Promise.all([
    playerService.getPlayer(id, { populate: false }),
    userService.getUserQueues(req.user._id)
  ]);

  if (!player) {
    return next(new AppError('Player is not found', 404));
  }

  let queue;

  // Change player state
  player.isPlaying = true;
  // handle deviceId
  if (deviceId) {
    player = await playerService.addDeviceToPlayer(player, deviceId);
    if (!player)
      return next(new AppError('Device is not found', 404));
  }
  // handle Queue
  if (contextUri) {
    queue = await queueService.createQueueWithContext(contextUri);

    if (!queue) {
      return next(new AppError('Context is not found', 404));
    }

    queues = await userService.addQueue(queue, queues);

    const uri = contextUri.split(':');
    const context = {
      type: uri[1],
      id: uri[2]
    }

    playerService.setPlayerToDefault(player);
    playerService.addTrackToPlayer(player, queue.tracks[0], context);
  }
  // add current track
  if (uris && uris.length) {
    // fill tracks array
    queue = await queueService.fillQueueFromTracksUris(uris, queues, player);
  }

  if (offset) {
    player = await playerService.startPlayingFromOffset(player, queue, offset, queues);
  }
  // change position
  if (player.item && positionMs) {
    player.progressMs = positionMs;
    const track = await trackService.findTrack(player.item);
    // if position >= track duration go to next
    if (track && positionMs >= track.duration) {

      player = await playerService.changePlayerProgress(player, positionMs, queues);

      if (!player)
        next(new AppError('Queue is not found', 404));
    }
  }
  if (!player.item) {
    return next(new AppError('Nothing to be played', 404));
  }

  if (player.context && player.context.type !== 'unknown')
    playHistoryService.addToHistory(id, player.context); // add to history


  // add queues to user
  req.user.queues = queues;
  // save
  await Promise.all([req.user.save({ validateBeforeSave: false }), player.save()]);
  // return 204
  res.status(204).end();
};


/**
 * @version 1.0.0
 * @public
 * @async
 * @throws AppError 500 status
 * @throws AppError 404 status
 * @author Abdelrahman Tarek
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @description Seek to positionMs
 * @summary Seek the player
 */
exports.seekPlayer = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Must Authenticate user', 500));
  }

  const { positionMs, deviceId } = req.query;

  const id = req.user._id;

  let player = await playerService.getPlayer(id, { populate: false });

  if (!player) {
    return next(new AppError('Player is not found', 404));
  }

  if (deviceId) {
    player = await playerService.addDeviceToPlayer(player, deviceId);
    if (!player)
      return next(new AppError('Device is not found', 404));
  }

  player.progressMs = positionMs;

  await player.save();

  res.status(204).end();
};