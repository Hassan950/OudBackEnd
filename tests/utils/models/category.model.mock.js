const {Category} = require('../../../src/models');
const faker = require('faker');
const _ = require('lodash');
const {browseService} =require('../../../src/services');

const save = jest.fn();


const categories = [

];

const createFakeStoredCategory = () => {
  const category = new Category({
    name: faker.name.title(),
    icon: faker.image.imageUrl(),
    playlists: [{
      name: faker.name.title(),
      image: faker.image.imageUrl()
    }]
  });
  category.save = jest.fn().mockImplementation(function() {
    save();
    return new Promise(function(resolve, reject) {
      resolve(this);
    })
  });
  categories.push(category);
  return category;
};

const createFakeNonStoredCategory = () => {
  const category = new Category({
    name: faker.name.title(),
    icon: faker.image.imageUrl(),
    playlists: [{
      name: faker.name.title(),
      image: faker.image.imageUrl()
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



browseService.findCategory = jest.fn().mockImplementation((neededCategory) => {
  return new Promise((resolve, reject) => {
    const category = _.find(categories, function(obj) {
        return obj.id == neededCategory.id;
      });
      if (category) {
        resolve(category);
      } else {
        resolve(null);
      }
  })
});
 browseService.findCategories = jest.fn().mockImplementation((query) => {
    return new Promise((resolve, reject) => {
      resolve(categories.slice(query.offset,query.limit));
    })
});

browseService.getPlaylists = jest.fn().mockImplementation((foundCategory,query) => {
  return new Promise((resolve, reject) => {
    resolve(foundCategory.playlists.slice(query.offset,query.limit));
  })
});


module.exports = {
    createFakeStoredCategory,
    createFakeNonStoredCategory,
    Category,
    categories,
    save
}