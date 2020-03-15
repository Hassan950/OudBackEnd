const { User } = require('../models');
const AppError = require('../utils/AppError');
const httpStatus = require('http-status');
const authService = require('./auth.service');

/**
 *
 * @param {Object} userData
 * @param {String} password
 * @returns user if user found and password is correct else return null
 */
const findUserAndCheckPassword = async (userData, password) => {
  const user = await User.findOne(userData).select('+password');
  if (!user || !(await authService.checkPassword(password, user.password))) {
    return null;
  }
  return user;
};

/**
 *
 * @param {String} userId
 * @param {String} password
 * @returns user if user found and password is correct else return null
 */
const findUserByIdAndCheckPassword = async (userId, password) => {
  const user = await User.findById(userId).select('+password');
  if (!user || !(await authService.checkPassword(password, user.password))) {
    return null;
  }
  return user;
};

/**
 *
 * @param {Object} userData
 * @returns new user
 */
const createUser = async userData => {
  const newUser = await User.create(userData);
  return newUser;
};

const getUser = async userId => {
  const user = await User.findById(userId, {
    role: 0,
    verified: 0,
    password: 0,
    username: 0
  });
  if (!user) {
    throw new AppError('User not found', httpStatus.NOT_FOUND);
  }
  return user;
};

const editProfile = async (userId, userData) => {
  let user = await User.findById(userId);
  if (user.email !== userData.email) {
    user.verified = false;
  }
  user = await User.findByIdAndUpdate(
    userId,
    {
      email: userData.email,
      birthDate: userData.dateOfBirth,
      country: userData.country,
      gender: userData.gender,
      displayName: userData.displayName,
      verified: user.verified
    },
    { new: true }
  );

  return user;
};

module.exports = {
  findUserAndCheckPassword,
  findUserByIdAndCheckPassword,
  createUser,
  getUser,
  editProfile
};
