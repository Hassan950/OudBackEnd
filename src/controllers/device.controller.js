const { deviceService } = require('../services');
const AppError = require('../utils/AppError.js');

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