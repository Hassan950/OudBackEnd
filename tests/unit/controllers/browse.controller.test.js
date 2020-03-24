const browseMocks = require('../../utils/mock services/browse.service.mock');
const requestMocks = require('../../utils/request.mock.js');
const { browseController } = require('../../../src/controllers');
let { Category , Album  }= require('../../../src/models');
const _ = require('lodash');

describe('browse controllers', () => {
  let category;
  let req;
  let res;
  let next;
  let newCategory;
  let album;
  Category = browseMocks.Category;
  Album = browseMocks.Album;
  beforeEach(() => {
    category = browseMocks.createFakeStoredCategory();
    newCategory = browseMocks.createFakeNonStoredCategory();
    album = browseMocks.createFakeStoredAlbum();
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
    it('should return 200 if a category has the passed id exists', async() => {
      req.params = {};
      req.params = category;
      await browseController.getCategory(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return a category has the passed id exists', async() => {
      req.params = {};
      req.params = category;
      await browseController.getCategory(req, res, next);
      const foundCategory = res.json.mock.calls[0][0].category;
      expect(foundCategory).toBe(category);
    });
  })
  describe('categoryPlaylists - test', () => {
    it('should throw error 404 when invalid id is passed', async() => {
      req.params = {};
      req.params = newCategory;
      req.query = {};
      req.query = {
        offset: 0,
        limit: 1
      };
      await browseController.categoryPlaylists(req, res, next);
      //expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should return 200 if a category has the passed id exists', async() => {
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
    it('should return playlists of the category has the passed id exists', async() => {
      req.params = {};
      req.params = category;
      req.query = {};
      req.query = {
        offset: 0,
        limit: 1
      };
      await browseController.categoryPlaylists(req, res, next);
      const foundCategoryPlaylists = res.json.mock.calls[0][0].playlists.items;
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
      const foundCategories = res.json.mock.calls[0][0].categories.items;
      expect(foundCategories).toStrictEqual(browseMocks.addCategories.slice(0, 1));
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
    it('should return new releases ', async() => {
      req.query = {};
      req.query = {
        offset: 0,
        limit: 1
      };
      await browseController.newReleases(req, res, next);
      const foundAlbums = res.json.mock.calls[0][0].albums.items;
      expect(foundAlbums).toStrictEqual(browseMocks.releasedAlbums.slice(0, 1));
    });
  });
});