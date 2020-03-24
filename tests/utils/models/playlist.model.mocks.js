const { Playlist } = require('../../../src/models');
const faker = require('faker');
const mongoose = require('mongoose');
const save = jest.fn();

const createFakePlaylist = () => {
  const playlist = new Playlist({
    name: faker.name.title().slice(0,4),
    description: faker.name.jobDescriptor().slice(0,15),
    tracks: [{
      _id: mongoose.Types.ObjectId()
     }],
    owner : {
      _id: mongoose.Types.ObjectId()
    },
    collabrative: false,
    public: false,
    });
  playlist.save = jest.fn().mockImplementation(function() {
    save();
    return new Promise(function(resolve, reject) {
      resolve(this);
    })
  });
  return playlist;
};

module.exports = {
  createFakePlaylist,
  save
}
