const jwt = require('jsonwebtoken');
const config = require('config');

exports.generateAuthToken = (userId) => {
  return jwt.sign({
    id: userId
  }, config.get('JWT_KEY'), {
    expiresIn: config.get('JWT_EXPIRES_IN')
  });
};
