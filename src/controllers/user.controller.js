const { userService } = require('../services');
const AppError = require('../utils/AppError');
const httpStatus = require('http-status');

exports.getProfile = async (req, res) => {
  res.status(httpStatus.OK).send(req.user);
};

exports.editProfile = async (req, res) => {
  const user = userService.findUserByIdAndCheckPassword(req.user._id, req.body.passwordConfirm);
  if(!user) {
    throw new AppError('The password you entered doesn\'t match your password. Please try again.', httpStatus.BAD_REQUEST)
  }
  const profile = await userService.editProfile(req.user._id, req.body);
  res.status(httpStatus.OK).send(profile);
};
