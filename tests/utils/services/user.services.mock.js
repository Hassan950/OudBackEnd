const userMocks = require('../models/user.model.mocks.js');
const _ = require('lodash');

const getUser = jest.fn().mockImplementation((userData) => {
  return new Promise((resolve, reject) => {
    const user = _.find(userMocks.users, function (obj) {
      return obj.email === userData.email;
    });
    if (user) {
      resolve(user);
    } else {
      resolve(null);
    }
  })
});


module.exports = {
  getUser
};