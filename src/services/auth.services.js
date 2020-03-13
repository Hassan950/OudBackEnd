const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');

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

module.exports = {
  generateAuthToken,
  checkPassword
};