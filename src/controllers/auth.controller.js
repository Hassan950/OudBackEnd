const User = require('../models/user.model.js')
const authService = require('../services/auth.services.js');
const AppError = require('../utils/AppError.js');


/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Abdelrahman Tarek
 * @description takes user details from the user and return user and token with 200 status code
 *  if valid else return error with 400 status code
 * @summary User Registration
 */
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

/**
 * @version 1.0.0
 * @throws AppError 400 status
 * @author Abdelrahman Tarek
 * @description takes user email and password from the user and return user and token with 200 status code
 *  if valid else return error with 400 status code
 * @summary User Login
 */
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
