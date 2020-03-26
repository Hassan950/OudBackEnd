const { albumsController } = require('../../../src/controllers');
const mockingoose = require('mockingoose').default;
const requestMocks = require('../../utils/request.mock');
let { Album } = require('../../../src/models');

artistIds = [
  '5e6c8ebb8b40fc5508fe8b32',
  '5e6c8ebb8b40fc6608fe8b32',
  '5e6c8ebb8b40fc7708fe8b32'
];
albumIds = [
  '5e6c8ebb8b40fc5508fe8b32',
  '5e6f6a7fac1d6d06f40706f2',
  '5e6c8ebb8b40fc5518fe8b32'
];

describe('Albums Controller', () => {
  let req;
  let res;
  let next;
  let album;
  let albums;
  beforeEach(() => {
    album = new Album({
      album_type: 'single',
      album_group: 'compilation',
      artists: artistIds,
      genres: '5e6c8ebb8b40fc5518fe8b32',
      image: 'example.jpg',
      name: 'The Begining',
      release_date: '12-06-1999',
      tracks: [albumIds[0]]
    });
    albums = [album, albums];
    album.populate = jest.fn().mockReturnThis();
    album.select = jest.fn().mockReturnThis();
    albums.populate = jest.fn().mockReturnThis();
    albums.select = jest.fn().mockReturnThis();
    req = { params: {}, query: {}, body: {} };
    res = requestMocks.mockResponse();
    next = jest.fn();
  });
  describe('get Album', () => {
    it('Should return the album with the given ID with status code of 200', async () => {
      mockingoose(Album).toReturn(album, 'findOne');
      req.params.id = albumIds[0];
      await albumsController.getAlbum(req, res, next);
      expect(res.json.mock.calls[0][0]).toHaveProperty('album');
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('Should throw an error with status code 404', async () => {
      mockingoose(Album).toReturn(null, 'findOne');
      req.params.id = "a valid ID which doens't exist";
      await albumsController.getAlbum(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  describe('getAlbums', () => {
    it("Should return list of albums with the given ID's with status code 200", async () => {
      mockingoose(Album).toReturn(albums, 'find');
      req.query.ids = albumIds[0] + ',' + albumIds[1];
      await albumsController.getAlbums(req, res, next);
      result = res.json.mock.calls;
      expect(res.json.mock.calls[0][0]).toHaveProperty('albums');
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it("Should return an array of nulls if none of the ID's matches an album", async () => {
      mockingoose(Album).toReturn([], 'find');
      req.query.ids = 'one valid ID, another valid ID';
      await albumsController.getAlbums(req, res, next);
      expect(res.json.mock.calls[0][0].albums).toMatchObject([null, null]);
    });
    it("Should return the same result for the same ID (and null for invalid ID's)", async () => {
      mockingoose(Album).toReturn([album], 'find');
      req.query.ids =
        album._id + ',' + album._id + ',one existing ID, another valid ID';
      await albumsController.getAlbums(req, res, next);
      result = res.json.mock.calls;
      expect(result[0][0].albums[0]).toEqual(result[0][0].albums[1]);
      expect(result[0][0].albums[2]).toEqual(result[0][0].albums[3]);
      expect(result[0][0].albums[2]).toEqual(null);
    });
  });
  describe('findAlbumTracks', () => {
    it('Should return the tracks of the album with the given Id in a paging object with status code 200', async () => {
      mockingoose(Album).toReturn(album, 'findOne');
      req.params.id = album._id;
      req.query = { limit: 20, offset: 0 };
      await albumsController.findAlbumTracks(req, res, next);
      expect(res.json.mock.calls[0][0]).toMatchObject({
        items: album.tracks
      });
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('Should throw an error with status code 404 if the album is not found', async () => {
      mockingoose(Album).toReturn(null, 'findOne');
      req.params.id = "valid id that doesn't exist";
      req.query = { limit: 20, offset: 0 };
      await albumsController.findAlbumTracks(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('Should throw an error with status code 404 if the album has no tracks', async () => {
      album.tracks = [];
      mockingoose(Album).toReturn(album, 'findOne');
      req.params.id = album._id;
      req.query = { limit: 20, offset: 0 };
      await albumsController.findAlbumTracks(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  describe('deleteAblum', () => {
    it('Should return the deleted album with status code 200 if the album was found', async () => {
      mockingoose(Album)
        .toReturn(album, 'findOne')
        .toReturn(album, 'findOneAndDelete');
      req.user = { artist: album.artists[0]._id };
      req.params.id = album._id;
      await albumsController.findAndDeleteAlbum(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0]).toHaveProperty('album');
    });
    it('Should throw an error with status code 404 if the album is not found', async () => {
      mockingoose(Album)
        .toReturn(null, 'findOne')
        .toReturn(null, 'findOneAndDelete');
      req.user = { artist: album.artists[0]._id };
      req.params.id = album._id;
      await albumsController.findAndDeleteAlbum(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it("Should throw an error with status code 403 if the user is not the album's main artist", async () => {
      mockingoose(Album)
        .toReturn(album, 'findOne')
        .toReturn(album, 'findOneAndDelete');
      req.user = { artist: album.artists[1]._id };
      req.params.id = album._id;
      await albumsController.findAndDeleteAlbum(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
  });
  describe('releaseAlbum', () => {
    it('Should return the album updated with status code 200', async () => {
      mockingoose(Album)
        .toReturn(album, 'findOne')
        .toReturn(album, 'findOneAndUpdate');
      req.params.id = album._id;
      req.user = { artist: album.artists[0]._id };
      await albumsController.releaseAlbum(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0]).toHaveProperty('album');
    });
    it('Should throw an error with status code 404 if the album was not found', async () => {
      mockingoose(Album)
        .toReturn(null, 'findOne')
        .toReturn(null, 'findOneAndUpdate');
      req.params.id = album._id;
      req.user = { artist: album.artists[0]._id };
      await albumsController.releaseAlbum(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it("Should throw an error with status code 403 if the artist is not the album's main artist", async () => {
      mockingoose(Album)
        .toReturn(album, 'findOne')
        .toReturn(album, 'findOneAndUpdate');
      req.params.id = album._id;
      req.user = { artist: album.artists[1]._id }; // the right artist is artist[0]
      await albumsController.releaseAlbum(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
  });
});
