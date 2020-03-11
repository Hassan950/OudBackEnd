const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const AppError = require('./../utils/AppError.js');

exports.generateAuthToken = (userId) => {
  return jwt.sign({
    id: userId
  }, config.get('JWT_KEY'), {
    expiresIn: config.get('JWT_EXPIRES_IN')
  });
};

exports.checkPassword = async (password, correctPassword) => {
  const isPasswordMatch = await bcrypt.compare(password, correctPassword);
  return isPasswordMatch;
};
