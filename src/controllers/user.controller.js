const { userService } = require('../services');
const httpStatus = require('http-status')

exports.getProfile = async (req, res) => {
  res.status(httpStatus.OK).send(req.user);
};
