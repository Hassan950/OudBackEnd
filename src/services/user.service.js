const { User, Normal } = require('../models');
const authService = require('./auth.service');
const queueService = require('./queue.service')
const fs = require('fs');

/**
 * A method that find user with the given userData and check password with the given password
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @summary find user and check password
 * @param {Object} userData - User data to find with
 * @param {String} password - User password
 * @returns {Document} `user` if user found and password is correct
 * @returns {null} `null` if user not found or password is wrong
 */
const findUserAndCheckPassword = async (userData, password) => {
  const user = await User.findOne(userData).select('+password');
  if (!user || !await authService.checkPassword(password, user.password)) {
    return null;
  }
  return user;
};

/**
 * Find user by `userId` and check if `password` is correct
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {String} userId - User ID
 * @param {String} password - User password
 * @summary Find user by `userId` and check if `password` is correct
 * @returns {Document} `user` if user found and password is correct 
 * @returns {null} `null` if user is not found or password is not correct
 */
const findUserByIdAndCheckPassword = async (userId, password) => {
  const user = await User.findById(userId).select('+password');
  if (!user || !await authService.checkPassword(password, user.password)) {
    return null;
  }
  return user;
};

/**
 * A method that create user with the given data
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @summary Create new user
 * @param {Object} userData - User data to find with
 * @returns {Document} `newUser` if user is created
 * @returns {null} `null` if failed
 */
const createUser = async (userData) => {
  // create normal user
  const newUser = await Normal.create(userData);
  return newUser;
};

/**
 * A method that gets the User By its ID
 *
 * @function
 * @author Hassan Mohamed
 * @summary Get a User By ID
 * @param {Object} userId - The Id of the user
 * @returns {null} if user was not found
 * @returns {Document} if a user was found
 */

const getUserById = async userId => {
  const user = await User.findById(userId, {
    verified: 0,
    role: 0,
    username: 0,
    password: 0
  }).populate('artist');
  return user;
};

/**
 * A method that edits the user profile
 *
 * @function
 * @author Hassan Mohamed
 * @summary Edit the user's profile
 * @param {Object} user - The User's Current Data
 * @param {Object} userData - The new Data
 * @returns {Object} The user after updates
 */

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

/**
 * A method that updates the images paths of the user
 *
 * @function
 * @author Hassan Mohamed
 * @summary Update the images
 * @param {Object} user - The User's Current Data
 * @param {Object} images - The new paths
 * @returns {Object} The user after updates
 */

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
 * Get user with `userData`
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {Object} userData - User data to find with
 * @summary Get user with `userData`
 * @returns {Document} `user` with the given `userData`
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
};


/**
 * Get user Queues
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {String} userId - User ID
 * @summary Get user Queues
 * @returns {Array<String>} `queues`
 */
const getUserQueues = async (userId) => {
  const user = await User.findById(userId).select('queues');

  if (!user) return user;

  const queues = user.queues;

  return queues;
};

/**
 * Add `queue` to user `queues`
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {Document} queue - Queue
 * @param {Array<String>} queues - User Queues
 * @summary Add `queue` to user `queues`
 * @returns {Array<String>} `queues`
 */
const addQueue = (queue, queues) => {
  if (queues && queues.length) {
    if (queues.length > 1) {
      const queueId = queues[1];
      queues.pop();
      queueService.deleteQueueById(queueId);
    }

    queues.unshift(queue._id);
  } else {
    queues = [queue._id];
  }
  return queues;
};

module.exports = {
  findUserAndCheckPassword,
  findUserByIdAndCheckPassword,
  createUser,
  getUserById,
  getUser,
  deleteUserById,
  editProfile,
  updateImages,
  getUserQueues,
  addQueue
};
