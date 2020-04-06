const { playerService, deviceService, userService, trackService, playHistoryService, queueService } = require('../services');
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

  const link = `${req.protocol}://${req.get(
    'host'
  )}/api/uploads/tracks/`;
  const player = await playerService.getPlayer(id, { link: link });

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
    const device = await deviceService.getDevice(deviceId);
    if (!device) {
      return next(new AppError('Device is not found', 404));
    }
    player.device = deviceId;
  }
  // handle Queue
  if (contextUri) {
    queue = await queueService.createQueueWithContext(contextUri);

    if (!queue) {
      return next(new AppError('Context is not found', 404));
    }

    userService.addQueue(queue, queues);

    playerService.addTrackToPlayer(player, queue.tracks[0]);
  }
  // add current track
  if (uris && uris.length) {
    // fill tracks array
    queue = await queueService.fillQueueFromTracksUris(uris, queues, player);
  }

  if (offset && ((uris && uris.length) || (contextUri))) {
    player = await playerService.startPlayingFromOffset(player, queue, offset, queues);
  }

  if (player.item) {
    // change position
    if (positionMs) {
      player.positionMs = positionMs;
      const track = await trackService.findTrack(player.item);
      // if position >= track duration go to next
      if (track && positionMs >= track.duration) {
        if (player.repeatState !== 'track') {
          let queue = await queueService.getQueueById(queues[0], { selectDetails: true });

          if (!queue || !queue.tracks) {
            return next(new AppError('Queue is not found', 404));
          }

          // Shuffle state
          if (player.shuffleState) {
            queueService.goNextShuffle(player, queue);
          } else {
            queueService.goNextNormal(player, queue);
          }

          // add next track to player
          playerService.addTrackToPlayer(player, queue.tracks[queue.currentIndex]);
          queue.save(); // save the queue
        }
      }
    }

    if (player.context && player.context.type !== 'unknown')
      playHistoryService.addToHistory(id, player.context); // add to history

  }
  // add queues to user
  req.user.queues = queues;
  // save
  await Promise.all([req.user.save({ validateBeforeSave: false }), player.save()]);
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