const { User } = require('../models/user.model.js');
const authService = require('./auth.services.js');

/**
 * 
 * @param {Object} userData 
 * @param {String} password 
 * @returns user if user found and password is correct else return null
 */
const findUserAndCheckPassword = async (userData, password) => {
  const user = await User.findOne(userData).select('+password');
  if (!user || !await authService.checkPassword(password, user.password)) {
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
  if (!user || !await authService.checkPassword(password, user.password)) {
    return null;
  }
  return user;
};

/**
 * 
 * @param {Object} userData 
 * @returns new user
 */
const createUser = async (userData) => {
  const newUser = await User.create(userData);
  return newUser;
};


module.exports = {
  findUserAndCheckPassword,
  findUserByIdAndCheckPassword,
  createUser,
}