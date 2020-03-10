const catchAsync = require('./../utils/catchAsync.js');
const User = require('../models/user.model.js')
const authService = require('../services/auth.services.js');
const AppError = require('../utils/AppError.js');

exports.signup = async (req, res, next) => {
  if (req.body.password != req.body.passwordConfirm) {
    return next(new AppError('Please confirm your password', 400));
  }
  const newUser = await User.create(req.body);
  const token = authService.generateAuthToken(newUser._id);
  res.status(200).json({
    token: token,
    user: newUser
  });
};

exports.login = async (req, res, next) => {
  const {
    email,
    password
  } = req.body;
  const user = await User.findOne({
    email: email,
  }).select('+password');

  if (!user || await authService.checkPassword(password, user.password)) {
    return next(new AppError('Incorrect mail or password!', 401));
  }

  user.password = undefined;
  const token = authService.generateAuthToken(user._id);

  res.status(200).json({
    token: token,
    user: user
  });
};
