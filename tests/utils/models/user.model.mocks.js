const User = require('../../../src/models/user.model.js');
const moment = require('moment');
const faker = require('faker');
const _ = require('lodash');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    if (_.some(users, ['username', userData.username]) ||
      _.some(users, ['email', userData.email])) {
      reject({ error: 'That username already exists.' });
    } else {
      const newUser = {
        id: mongoose.Types.ObjectId(),
        ...userData._doc
      };
      bcrypt.hash(newUser.password, 8)
        .then((result) => {
          newUser.password = result;
          users.push(newUser);
          resolve(newUser);
        }, err => { });
    }
  });
};

User.findOne = jest.fn().mockImplementation((userData) => {
  return {
    select: jest.fn().mockResolvedValue(
      new Promise((resolve, reject) => {
        const user = _.find(users, function (obj) {
          return obj.email == userData.email;
        });
        if (user) {
          resolve(user);
        } else {
          resolve(null);
        }
      })
    )
  }
});

User.findById = jest.fn().mockImplementation((id) => {
  return new Promise((resolve, reject) => {
    const user = _.find(users, function (obj) {
      return obj._id == id;
    });
    if (user) {
      resolve(user);
    } else {
      resolve(null);
    }
  })
});

module.exports = {
  createFakeUser,
  User
}