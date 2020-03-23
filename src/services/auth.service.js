const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const crypto = require('crypto');

const generateAuthToken = (userId) => {
  return jwt.sign({
    id: userId
  }, config.get('JWT_KEY'), {
    expiresIn: config.get('JWT_EXPIRES_IN')
  });
};

const checkPassword = async (password, hashedPassword) => {
  const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
  return isPasswordMatch;
};

const createPasswordResetToken = (user) => {
  const resetToken = crypto.randomBytes(32).toString('hex');

  const passwordResetToken = getHashedToken(resetToken);

  const passwordResetExpires = Date.now() + 10 * 60 * 1000;

  user.passwordResetExpires = passwordResetExpires;
  user.passwordResetToken = passwordResetToken;

  return resetToken;
};

const createVerifyToken = (user) => {
  const verifyToken = crypto.randomBytes(32).toString('hex');

  const HashedVerifyToken = getHashedToken(verifyToken);

  user.verifyToken = HashedVerifyToken;

  return verifyToken;
};

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
  createVerifyToken
};