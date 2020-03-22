const { deviceService } = require('../services');
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