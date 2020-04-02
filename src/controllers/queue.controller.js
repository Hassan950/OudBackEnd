const { queueService, userService, playerService, deviceService } = require('../services');
const AppError = require('../utils/AppError.js');


/**
 * @version 1.0.0
 * @throws AppError 500 status
 * @throws AppError 400 status
 * @author Abdelrahman Tarek
 * @description get user queue
 * @summary Get user Queue
 */
exports.getQueue = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Must Authenticate user', 500));
  }
  const queues = await userService.getUserQueues(req.user._id);

  const queueIndex = req.query.queueIndex || 0;

  if (!queues || queueIndex > queues.length - 1) {
    return next(new AppError('No Queue with the given index', 400));
  }

  const id = queues[queueIndex];

  const queue = await queueService.getQueueById(id);

  if (!queue || !queue.tracks || !queue.tracks.length) {
    return res.status(204).end();
  }

  res.status(200).json({
    tracks: queue.tracks,
    total: queue.tracks.length
  })
};

/**
 * @version 1.0.0
 * @throws AppError 500 status
 * @throws AppError 404 status
 * @author Abdelrahman Tarek
 * @description Change repeat mode
 * @summary Repeat the queue
 */
exports.repeatQueue = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Must Authenticate user', 500));
  }

  const { state, deviceId } = req.query;

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

  player.repeatState = state;

  await player.save();

  res.status(204).end();
};