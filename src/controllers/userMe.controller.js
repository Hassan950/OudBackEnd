const { userMeService } = require('../services');
const AppError = require('../utils/AppError.js');
const config = require('config');
const httpStatus = require('http-status');

exports.getProfile = async (req, res) => {
  const profile = await userMeService.getUser(req.user._id);
  res.status(httpStatus.OK).send(req.user);
};
