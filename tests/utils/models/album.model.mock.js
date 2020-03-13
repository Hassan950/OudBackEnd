const {Album} = require('../../../src/models');
const faker = require('faker');
const _ = require('lodash');
const {browseService} =require('../../../src/services');

const save = jest.fn();


const albums = [

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
  albums.push(album);
  return album;
};
//this find mocks a find fun in browse fun
browseService.getNewReleases = jest.fn().mockImplementation((query) => {
  return new Promise((resolve, reject) => {
    albums.forEach(element => {
      if (element.released && element.release_date == /.*2020.*/) releasedAlbums.push(element);
    });
    resolve(releasedAlbums.slice(query.offset,query.limit));
  })
});
module.exports = {
  createFakeStoredAlbum,
  Album,
  albums,
  releasedAlbums,
  save
}