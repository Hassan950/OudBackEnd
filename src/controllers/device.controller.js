const { deviceService, playerService } = require('../services');
const AppError = require('../utils/AppError.js');

/**
 * @version 1.0.0
 * @throws AppError 500 status
 * @author Abdelrahman Tarek
 * @description get user`s available devices
 * @summary User devices
 */
exports.getUserDevices = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Must Authenticate user', 500));
  }

  const id = req.user._id;

  const devices = await deviceService.getAvailableDevices(id);

  res.status(200).json({
    devices
  });
};


/**
 * @version 1.0.0
 * @throws AppError 500 status
 * @throws AppError 404 status
 * @author Abdelrahman Tarek
 * @description transfer playback to other device
 * @summary transfer playback to other device
 */
exports.transferPlayback = async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Must Authenticate user', 500));
  }

  const deviceId = req.body.deviceIds[0];
  const play = req.body.play || false;

  const id = req.body._id;

  const player = await playerService.getPlayer(id);

  if (!player) {
    return next(new AppError('Player is not found', 404));
  }

  const device = await deviceService.getDevice(deviceId);

  if (!device) {
    return next(new AppError('Device is not found', 404));
  }

  player.device = deviceId;
  player.item = player.item._id; // so we don't save the whole track
  await player.save();

  res.status(204).end();
}