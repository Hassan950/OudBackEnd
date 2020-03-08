const catchAsync = require('./../utils/catchAsync.js');
const User = require('../models/user.model.js')
const authService = require('../services/auth.services.js');
const AppError = require('../utils/AppError.js');

exports.signup = catchAsync(async (req, res, next) => {
  if (req.body.password != req.body.passwordConfirm) {
    return next(new AppError(400, 'Please confirm your password'));
  }
  const newUser = await User.create(req.body);
  const token = authService.generateAuthToken(newUser._id);
  res.status(200).json({
    token: token,
    user: newUser
  });
});
