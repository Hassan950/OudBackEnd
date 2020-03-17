const {Category , Album} = require('../../../src/models');
const faker = require('faker');
const _ = require('lodash');
const {browseService} =require('../../../src/services');
const mongoose = require('mongoose');
const AppError = require('../../../src/utils/AppError');

const save = jest.fn();


const addCategories = [

];

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
  addCategories.push(category);
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
    const category = _.find(addCategories, function(obj) {
        return obj.id == neededCategory.id;
      });
      if (category) {
        resolve(category);
      } else {
        resolve(null);
      }
  })
});
 browseService.findCategories = jest.fn().mockImplementation(async(query) => {
   const total = addCategories.length;
   const categoriess =  new Promise((resolve,reject)=>{
resolve(addCategories.slice(query.offset,query.limit));
   });
  let categories = await categoriess;
  return { categories,total}; 
});


browseService.getPlaylists = jest.fn().mockImplementation(async(neededCategory,query) => {
  const neededPlaylists =  new Promise((resolve, reject) => {
    const foundCategory = _.find(addCategories, function(obj) {
      return obj.id == neededCategory.id;
    });
    if (foundCategory) {
      resolve(foundCategory.playlists.slice(query.offset,query.limit));
    } else {
      resolve(null);
    }
   
  })
  let playlists = await neededPlaylists;
  if(!playlists){const total =0 ;return{playlists ,total};}
  const total = playlists.length;
  return{playlists , total};
});

const albumss = [

];
const releasedAlbums = [];

const createFakeStoredAlbum = () => {
  const album = new Album({
    name: faker.name.title(),
    released: true,
    release_date: '1/1/2020',
    image: faker.image.imageUrl(),
    album_type: 'single',
    album_group: 'single',
    artists: [{
        name: faker.name.title(),
    }],
    genres: [{
        name: faker.name.title(),
    }]
  });
  album.save = jest.fn().mockImplementation(function() {
    save();
    return new Promise(function(resolve, reject) {
      resolve(this);
    })
  });
  albumss.push(album);
  return album;
};
browseService.getNewReleases = jest.fn().mockImplementation(async(query) => {
   const total = albumss.length;
  const albumsss =  new Promise((resolve,reject)=>{
    albumss.forEach(element => {
     releasedAlbums.push(element);  
     });     
    resolve(releasedAlbums.slice(query.offset,query.limit));
   });
   let albums = await albumsss;
   return {albums ,total};
});

module.exports = {
  createFakeStoredAlbum,
  Album,
  albumss,
  releasedAlbums,
  createFakeStoredCategory,
  createFakeNonStoredCategory,
  Category,
  addCategories,
  save
}