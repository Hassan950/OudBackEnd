const { User } = require('../models');
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

const editProfile = async (userId, userData) => {
  let user = await User.findById(userId);
  console.log(user.email, userData.email);
  if(user.email !== userData.email) {
    user.verified = false;
  }
  user = await User.findByIdAndUpdate(userId, {
    email: userData.email,
    birthDate: userData.dateOfBirth,
    country: userData.country,
    gender: userData.gender,
    displayName: userData.displayName,
    verified: user.verified
  }, { new: true })

  return user;
};

module.exports = {
  findUserAndCheckPassword,
  findUserByIdAndCheckPassword,
  createUser,
  editProfile
};
