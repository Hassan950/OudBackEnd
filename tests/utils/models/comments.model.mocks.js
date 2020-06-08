const { AlbumComments, PlaylistComments } = require('../../../src/models');
const faker = require('faker');
const mongoose = require('mongoose');
const save = jest.fn();

const createFakeStoredAlbumComment = () => {
  const comment = new AlbumComments({
    userName: "Messi",
    albumId: mongoose.Types.ObjectId(),
    comment: "faker.date"
  });
  comment.save = jest.fn().mockImplementation(function() {
    save();
    return new Promise(function(resolve, reject) {
      resolve(this);
    });
  });
  return comment;
};

module.exports = {
  createFakeStoredAlbumComment,
  save
};
