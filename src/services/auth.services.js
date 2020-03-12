const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const AppError = require('./../utils/AppError.js');

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


const createTokenAndSend = (user, res) => {
  const token = generateAuthToken(user._id);
  res.setHeader('x-auth-token', token);
  return res.status(200).json({
    token: token,
    user: user
  });
};

module.exports = {
  generateAuthToken,
  checkPassword,
  createTokenAndSend
};