const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const crypto = require('crypto');

/**
 * Generate Authentication token
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @summary Generate Authentication token
 * @param {String} userId User ID
 * @returns {String} `token` authentication token
 */
const generateAuthToken = (userId) => {
  return jwt.sign({
    id: userId
  }, config.get('JWT_KEY'), {
    expiresIn: config.get('JWT_EXPIRES_IN')
  });
};

/**
 * Generate Refresh token
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @summary Generate Refresh token
 * @param {String} userId User ID
 * @returns {String} `refreshToken` refresh token
 */
const generateRefreshToken = (userId) => {
  const refreshToken = userId.toString() + '.' +  crypto.randomBytes(256).toString('hex');
  return refreshToken;
};

/**
 * Check if password is correct 
 * 
 * @function
 * @public
 * @async
 * @author Abdelrahman Tarek
 * @param {String} password 
 * @param {String} hashedPassword 
 * @summary Check if password is correct 
 * @returns {Boolean} `isPasswordMatch` is `true` the password is correct
 */
const checkPassword = async (password, hashedPassword) => {
  const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
  return isPasswordMatch;
};


/**
 * Create password reset token 
 * 
 * @function
 * @public
 * @author Abdelrahman Tarek
 * @param {Document} user User
 * @summary Create password reset token 
 * @returns {String} `resetToken`
 */
const createPasswordResetToken = (user) => {
  const resetToken = crypto.randomBytes(32).toString('hex');

  const passwordResetToken = getHashedToken(resetToken);

  const passwordResetExpires = Date.now() + 10 * 60 * 1000;

  user.passwordResetExpires = passwordResetExpires;
  user.passwordResetToken = passwordResetToken;

  return resetToken;
};

/**
 * Create verify token
 * 
 * @function
 * @public
 * @author Abdelrahman Tarek
 * @param {Document} user User
 * @summary Create verify token
 * @returns {String} `verifyToken`
 */
const createVerifyToken = (user) => {
  const verifyToken = crypto.randomBytes(32).toString('hex');

  const HashedVerifyToken = getHashedToken(verifyToken);

  user.verifyToken = HashedVerifyToken;

  return verifyToken;
};

/**
 * Hash token
 * 
 * @function
 * @public
 * @author Abdelrahman Tarek
 * @param {String} token Token to be hashed
 * @summary Hash token
 * @returns {String} `hashedToken`
 */
const getHashedToken = (token) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  return hashedToken;
}

module.exports = {
  generateAuthToken,
  checkPassword,
  createPasswordResetToken,
  getHashedToken,
  createVerifyToken,
  generateRefreshToken
};