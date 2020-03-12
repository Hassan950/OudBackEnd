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

  const passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const passwordResetExpires = Date.now() + 10 * 60 * 1000;

  user.passwordResetExpires = passwordResetExpires;
  user.passwordResetToken = passwordResetToken;

  return resetToken;
};

module.exports = {
  generateAuthToken,
  checkPassword,
  createPasswordResetToken
};