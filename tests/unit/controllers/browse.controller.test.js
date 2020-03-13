const categoryMocks = require('../../utils/models/category.model.mock.js');
const albumMocks = require('../../utils/models/album.model.mock.js');
const requestMocks = require('../../utils/request.mock.js');
const { browseController } = require('../../../src/controllers');
let {Category , Album}= require('../../../src/models');
const _ = require('lodash');

describe('browse controllers', () => {
  let category;
  let req;
  let res;
  let next;
  let newCategory;
  let album;
  Category = categoryMocks.Category;
  Album = albumMocks.Album;
  beforeEach(() => {
    category = categoryMocks.createFakeStoredCategory();
    newCategory = categoryMocks.createFakeNonStoredCategory();
    album = albumMocks.createFakeStoredAlbum();
    req = requestMocks.mockRequest(category);
    res = requestMocks.mockResponse();
    next = jest.fn();
  });

  describe('getCategory - test', () => {
    it('should throw error 404 when invalid id is passed', async() => {
      req.params = {};
      req.params = newCategory;
      await browseController.getCategory(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should return 200 if a category has the passed id exits', async() => {
      req.params = {};
      req.params = category;
      await browseController.getCategory(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return a category has the passed id exits', async() => {
      req.params = {};
      req.params = category;
      await browseController.getCategory(req, res, next);
      const foundCategory = res.send.mock.calls[0][0];
      expect(foundCategory).toBe(category);
    });
  })
  describe('categoryPlaylists - test', () => {
    it('should throw error 404 when invalid id is passed', async() => {
      req.params = {};
      req.params = newCategory;
      await browseController.categoryPlaylists(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should return 200 if a category has the passed id exits', async() => {
      req.params = {};
      req.params = category;
      req.query = {};
      req.query = {
        offset: 0,
        limit: 1
      };
      await browseController.categoryPlaylists(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return playlists of the category has the passed id exits', async() => {
      req.params = {};
      req.params = category;
      req.query = {};
      req.query = {
        offset: 0,
        limit: 1
      };
      await browseController.categoryPlaylists(req, res, next);
      const foundCategoryPlaylists = res.send.mock.calls[0][0];
      expect(foundCategoryPlaylists).toStrictEqual(category.playlists.slice(0, 1));
    });
  });
  describe('getCategories - test', () => {
    it('should return 200 ', async() => {
      req.query = {};
      req.query = {
        offset: 0,
        limit: 1
      };
      await browseController.getCategories(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });

    it('should return list of categories ', async() => {
      req.query = {};
      req.query = {
        offset: 0,
        limit: 1
      };
      await browseController.getCategories(req, res, next);
      const foundCategories = res.send.mock.calls[0][0];
      expect(foundCategories).toStrictEqual(categoryMocks.categories.slice(0, 1));
    });
});
  describe('newReleases - test', () => {
    it('should return 200 ', async() => {
      req.query = {};
      req.query = {
        offset: 0,
        limit: 1
      };
      await browseController.newReleases(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return 200 ', async() => {
      req.query = {};
      req.query = {
        offset: 0,
        limit: 1
      };
      await browseController.newReleases(req, res, next);
      const foundAlbums = res.send.mock.calls[0][0];
      expect(foundAlbums).toStrictEqual(albumMocks.releasedAlbums.slice(0, 1));
    });
  });
});