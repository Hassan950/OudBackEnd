const { likedAlbums } = require('../../../src/models');
const faker = require('faker');
const mongoose = require('mongoose');
const save = jest.fn();

const createFakeStoredLikedAlbum = () => {
  const likedAlbum = new likedAlbums({
    userId: mongoose.Types.ObjectId(),
    album: mongoose.Types.ObjectId(),
    addedAt: faker.date
  });
  likedAlbum.save = jest.fn().mockImplementation(function() {
    save();
    return new Promise(function(resolve, reject) {
      resolve(this);
    });
  });
  return likedAlbum;
};

module.exports = {
  createFakeStoredLikedAlbum,
  save
};
