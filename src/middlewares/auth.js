const { promisify } = require('util');
const config = require('config');
const AppError = require('../utils/AppError.js');
const { User } = require('../models/user.model.js');
const jwt = require('jsonwebtoken');

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

  // check if user still exists
  const user = await User.findById(payload.id);
  if (!user)
    return next(
      new AppError(
        'The user belonging to this token does no longer exists.',
        401
      )
    )

  // check if user changed password
  if (user.changedPasswordAfter(payload.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

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

