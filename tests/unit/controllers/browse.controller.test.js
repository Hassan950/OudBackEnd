const requestMocks = require('../../utils/request.mock.js');
const { browseController } = require('../../../src/controllers');
let { Category, Album, Playlist } = require('../../../src/models');
const mockingoose = require('mockingoose').default;

const playlistsIds = ['5e6dea511e17a305285ba614', '5e6dea511e17a305285ba615'];

const categoriesIds = ['5e6dea511e17a305285ba616', '5e6dea511e17a305285ba617'];

const trackIds = [
  '5e6c8ebb8b40fc5508fe8b89',
  '5e6f6a7fac1d6d06f4070b99',
  '5e6c8ebb8b40fc5518fe8b97'
];
const artistIds = [
  '5e6c8ebb8b40fc5508fe8b32',
  '5e6c8ebb8b40fc6608fe8b31',
  '5e6c8ebb8b40fc7708fe8b30'
];
const genreIds = [
  '5e6c8ebb8b40fc5508fe8b20',
  '5e6c8ebb8b40fc6608fe8b21',
  '5e6c8ebb8b40fc7708fe8b22'
];

describe('browse controllers', () => {
  let category;
  let req;
  let res;
  let next;
  let categories;
  let albums;
  let album;
  let playlist;
  let playlists;
  beforeEach(() => {
    category = new Category({
      name: 'MGZ',
      icon: 'category.jpg',
      playlists: playlistsIds
    });
    album = new Album({
      name: 'MGZZZ',
      released: true,
      released_date: '12/11/2019',
      artists: artistIds,
      album_type: 'single',
      album_group: 'single',
      image: 'image.jpg',
      genres: genreIds
    });
    playlist = new Playlist({
      name: 'playlist1',
      public: true,
      collabrative: true,
      description: 'dsjbfjdbgjksdn',
      owner: '5e6c8ebb8b40fc7708fe8b74',
      tracks: trackIds
    });
    albums = [album, album];
    categories = [category, category];
    playlists = [playlist, playlist];
    req = { params: {}, query: {}, body: {} };
    res = requestMocks.mockResponse();
    next = jest.fn();
  });

  describe('getCategory - test', () => {
    it('should throw error 404 when invalid id is passed', async () => {
      req.params.id = 'invalid';
      Category.select = jest.fn().mockReturnThis();
      mockingoose(Category).toReturn(null, 'findOne');
      await browseController.getCategory(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should return 200 if a category has the passed id exists', async () => {
      req.params.id = categoriesIds;
      Category.select = jest.fn().mockReturnThis();
      mockingoose(Category).toReturn(category, 'findOne');
      await browseController.getCategory(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return a category has the passed id exists', async () => {
      req.params.id = categoriesIds;
      Category.select = jest.fn().mockReturnThis();
      mockingoose(Category).toReturn(category, 'findOne');
      await browseController.getCategory(req, res, next);
      const foundCategory = res.json.mock.calls[0][0];
      expect(foundCategory).toBe(category);
    });
  });
  describe('categoryPlaylists - test', () => {
    it('should throw error 404 when invalid id is passed', async () => {
      req.params.id = 'invalid';
      req.query = {
        offset: 0,
        limit: 1
      };
      mockingoose(Category).toReturn(null, 'findOne');
      await browseController.categoryPlaylists(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should return 200 if a category has the passed id exists', async () => {
      req.params.id = categoriesIds[0];
      req.query = {
        offset: 0,
        limit: 1
      };
      mockingoose(Category).toReturn(category, 'findOne');
      mockingoose(Playlist).toReturn(playlists, 'find');
      await browseController.categoryPlaylists(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return playlists of the category has the passed id exists', async () => {
      req.params.id = categoriesIds[0];
      req.query = {
        offset: 0,
        limit: 1
      };
      mockingoose(Category).toReturn(category, 'findOne');
      mockingoose(Playlist).toReturn(playlists.slice(0, 1), 'find');
      await browseController.categoryPlaylists(req, res, next);
      const foundCategoryPlaylists = res.json.mock.calls[0][0].items;
      expect(JSON.parse(JSON.stringify(foundCategoryPlaylists))).toStrictEqual(
        JSON.parse(JSON.stringify(playlists.slice(0, 1)))
      );
    });
  });
  describe('getCategories - test', () => {
    it('should return 200 ', async () => {
      req.query = {
        offset: 0,
        limit: 1
      };
      Category.select = jest.fn().mockReturnThis();
      mockingoose(Category).toReturn(categories, 'find');
      await browseController.getCategories(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });

    it('should return list of categories ', async () => {
      req.query = {
        offset: 0,
        limit: 1
      };
      Category.select = jest.fn().mockReturnThis();
      mockingoose(Category).toReturn(categories.slice(0, 1), 'find');
      await browseController.getCategories(req, res, next);
      const foundCategories = res.json.mock.calls[0][0].items;
      expect(JSON.parse(JSON.stringify(foundCategories))).toStrictEqual(
        JSON.parse(JSON.stringify(categories.slice(0, 1)))
      );
    });
  });
  describe('newReleases - test', () => {
    it('should return 200 ', async () => {
      req.query = {
        offset: 0,
        limit: 1
      };
      albums.sort = jest.fn().mockReturnThis();
      mockingoose(Album).toReturn(albums, 'find');
      await browseController.newReleases(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return new releases ', async () => {
      req.query = {
        offset: 0,
        limit: 1
      };
      albums.sort = jest.fn().mockReturnThis();
      albums.skip = jest.fn().mockReturnThis();
      albums.limit = jest.fn().mockReturnThis();
      mockingoose(Album).toReturn(albums.slice(0, 1), 'find');
      await browseController.newReleases(req, res, next);
      const foundAlbums = res.json.mock.calls[0][0].items;
      expect(JSON.parse(JSON.stringify(foundAlbums))).toStrictEqual(
        JSON.parse(JSON.stringify(albums.slice(0, 1)))
      );
    });
  });
});
