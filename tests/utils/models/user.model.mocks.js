const User = require('../../../src/models/user.model.js');
const moment = require('moment');
const faker = require('faker');
const _ = require('lodash');
const mongoose = require('mongoose');

const createFakeUser = () => {
  const password = faker.internet.password(8, true);
  const user = new User({
    displayName: faker.name.firstName(),
    username: faker.name.findName(),
    email: faker.internet.email(),
    images: [
      faker.internet.url()
    ],
    password: password,
    passwordConfirm: password,
    role: 'free',
    birthDate: faker.date.between(moment().subtract(11, 'years'), moment().subtract(150, 'years')), // from 11 to 150 years
    gender: 'M',
    verified: false,
    country: 'EG'
  });
  return user;
};

const users = [
  {
    ...createFakeUser()._doc,
    _id: mongoose.Types.ObjectId()
  },
  {
    ...createFakeUser()._doc,
    _id: mongoose.Types.ObjectId()
  },
  {
    ...createFakeUser()._doc,
    _id: mongoose.Types.ObjectId()
  }
];


User.create = userData => {
  return new Promise((resolve, reject) => {
    if (_.some(users, ['username', userData.username]),
      _.some(users, ['email', userData.email])) {
      reject({ error: 'That username already exists.' });
    } else {
      const newUser = {
        id: mongoose.Types.ObjectId(),
        ...userData._doc
      }; users.push(newUser);
      resolve(newUser);
    }
  });
};

module.exports = {
  createFakeUser,
  User
}