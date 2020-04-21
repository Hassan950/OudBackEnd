const { likedTracks } = require('../../../src/models');
const faker = require('faker');
const mongoose = require('mongoose');
const save = jest.fn();

const createFakeStoredLikedTrack = () => {
  const likedTrack = new likedTracks({
    userId: mongoose.Types.ObjectId(),
    track: mongoose.Types.ObjectId(),
    addedAt: faker.date
  });
  likedTrack.save = jest.fn().mockImplementation(function() {
    save();
    return new Promise(function(resolve, reject) {
      resolve(this);
    });
  });
  return likedTrack;
};

module.exports = {
  createFakeStoredLikedTrack,
  save
};
