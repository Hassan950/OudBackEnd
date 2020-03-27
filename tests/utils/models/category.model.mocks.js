const { Category } = require('../../../src/models');
const faker = require('faker');
const mongoose = require('mongoose');
const save = jest.fn();

const createFakeStoredCategory = () => {
  const category = new Category({
    name: faker.name.title().slice(0,4),
    icon: faker.image.imageUrl(),
    playlists: [{
     _id: mongoose.Types.ObjectId()
    }]
  });
  category.save = jest.fn().mockImplementation(function() {
    save();
    return new Promise(function(resolve, reject) {
      resolve(this);
    })
  });
  return category;
};


module.exports = {
  createFakeStoredCategory,
  save
}
