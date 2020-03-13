const httpStatus = require('http-status');
const { User } = require('../models');
const AppError = require('./../utils/AppError.js');

exports.getUser = async userId => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', httpStatus.NOT_FOUND);
  }
  return user;
};
