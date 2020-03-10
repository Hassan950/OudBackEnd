const User = require('../models/user.model.js')
const authService = require('../services/auth.services.js');
const AppError = require('../utils/AppError.js');
const jwt = require('jsonwebtoken');
const config = require('config');
const { promisify } = require('util');

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

exports.authenticate = async (req, res, next) => {
  // getting token and check if it is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next(new AppError('Please log in.', 401));

  // verification token
  const payload = await promisify(jwt.verify)(token, config.get('JWT_KEY'));

  // check if user still exists
  const user = await User.findById(payload.id);
  if (!user)
    return next(
      new AppError(
        'The user belonging to this token does no longer exists.',
        401
      )
    )
  req.user = user;
  next();
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};
