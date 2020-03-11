const { User } = require('../models/user.model.js')
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
 * @todo return 401 if set role to premium without credit or atrtist without request
 */
exports.signup = async (req, res, next) => {
  if (req.body.password != req.body.passwordConfirm) {
    return next(new AppError('Please confirm your password', 400));
  }
  const newUser = await User.create(req.body);
  const token = authService.generateAuthToken(newUser._id);
  // TODO
  // Return 401 if role is premium without credit 
  // Return 401 if role is artist without request
  // Add device
  // Send token as header
  // use mail to verify user

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

  if (!user || !await authService.checkPassword(password, user.password)) {
    return next(new AppError('Incorrect mail or password!', 401));
  }

  // TODO
  // Add device
  // Send token as header

  user.password = undefined;
  const token = authService.generateAuthToken(user._id);
  res.status(200).json({
    token: token,
    user: user
  });
};

/**
 * @version 1.0.0
 * @throws AppError 400 status, AppError 401 status 
 * @author Abdelrahman Tarek
 * @description takes currentPassword, Password and passwordConfirm. if currentPassword is wrong return 401 status
 * if password != passwordConfirm return 400
 * @summary User Update Password
 */
exports.updatePassword = async (req, res, next) => {
  const {
    currentPassword,
    password,
    passwordConfirm
  } = req.body;

  if (!req.user) {
    return next(new AppError('PLease Authentcate first', 500));
  }
  // get user with a password
  const user = await User.findById(req.user._id).select('+password');
  if (!user || !await authService.checkPassword(currentPassword, user.password)) {
    return next(new AppError('Incorrect password!', 401));
  }
  if (password != passwordConfirm) {
    return next(new AppError('Please confirm your password', 400));
  }

  user.password = password;
  user.passwordConfirm = password;


  // TODO
  // Add last change password date

  await user.save();
  const token = authService.generateAuthToken(user._id);

  res.status(200).json({
    token: token,
    user: user
  });
};

/**
 * @version 1.0.0
 * @throws AppError 401 if no/wrong token passed 
 * @author Abdelrahman Tarek
 * @description takes user token to authenticate user
 * @summary User Authentication
 */
exports.authenticate = async (req, res, next) => {
  // getting token and check if it is there
  let token;
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next(new AppError('Please log in.', 401));

  // verification token
  const payload = await promisify(jwt.verify)(token, config.get('JWT_KEY'));


  // TODO
  // Add checks if the user changed password after creating this token

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

/**
 * @version 1.0.0
 * @throws AppError 403 if user doesn`t have permission 
 * @author Abdelrahman Tarek
 * @description give permission to users based on roles
 * @summary User Authorization
 */
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
