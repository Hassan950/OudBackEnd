const { User } = require('../models');
const { authService } = require('./');
const fs = require('fs');

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

const getUserById = async userId => {
  const user = await User.findById(userId, {
    verified: 0,
    role: 0,
    username: 0,
    password: 0
  }).populate('artist');
  return user;
};

const editProfile = async (user, userData) => {
  if (user.email !== userData.email) {
    user.verified = false;
  }
  user = await User.findByIdAndUpdate(
    user._id,
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

const updateImages = async (user, images) => {
  const paths = user.images.filter(
    path =>
      !path
        .split('\\')
        .pop()
        .match(/^(default-){1,1}.*\.(jpg|png|jpeg)$/)
  );
  paths.forEach(path =>
    fs.unlink(path, err => {
      if (err) throw err;
      console.log(`delete ${path}`);
    })
  );
  user = await User.findByIdAndUpdate(
    user._id,
    {
      images: images
    },
    { new: true }
  );
  return user;
};

/**
 * 
 * @param {Object} userData 
 * @returns user with the given userDate
 */
const getUser = async (userData) => {
  const user = await User.findOne(userData);
  return user;
};


/**
 * 
 * @param {String} userId 
 * @returns deletedUser
 */
const deleteUserById = async (userId) => {
  const deletedUser = await User.findByIdAndDelete(userId, { select: true });
  return deletedUser;
}

module.exports = {
  findUserAndCheckPassword,
  findUserByIdAndCheckPassword,
  createUser,
  getUserById,
  getUser,
  deleteUserById,
  editProfile,
  updateImages
};
