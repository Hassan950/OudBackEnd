const { artistController } = require('../../../src/controllers');
const mockingoose = require('mockingoose').default;
const requestMocks = require('../../utils/request.mock');
const {
  Artist,
  User,
  Track,
  Album,
  Request,
  Genre
} = require('../../../src/models');
let fs = require('fs').promises;

trackIds = [
  { _id: '5e6c8ebb8b40fc5508fe8b32' },
  { _id: '5e6f6a7fac1d6d06f40706f2' },
  { _id: '5e6c8ebb8b40fc5518fe8b32' }
];

describe('Artists Controller', () => {
  let req;
  let res;
  let next;
  let artist;
  let artists;
  beforeEach(() => {
    artist = new Artist({
      displayName: 'Test artist',
      password: '12341234',
      passwordConfirm: '12341234',
      email: 'testing@gmail.com',
      username: 'test-man',
      country: 'EG',
      genres: ['5e6c8ebb8b40fc5518fe8b32'],
      images: [
        'uploads\\users\\default-Profile.jpg',
        'uploads\\users\\default-Cover.jpg'
      ],
      popularSongs: trackIds,
      bio: 'I am not a real artist I am just here for testing.'
    });
    artists = [artist, artist];
    req = { params: {}, query: {}, body: {} };
    res = requestMocks.mockResponse();
    next = jest.fn();
    Artist.schema.path('popularSongs', Object);
  });
  describe('getArtist', () => {
    it('Should return the artist with status code 200', async () => {
      mockingoose(User).toReturn(artist, 'findOne');
      await artistController.getArtist(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0]).toMatchObject(artist);
    });
    it('Should throw an error with status code 404 if the artist is not found', async () => {
      mockingoose(User).toReturn(null, 'findOne');
      await artistController.getArtist(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  describe('getArtists', () => {
    it("Should return the artists with nulls against unmatched ID's with status code 200", async () => {
      mockingoose(User).toReturn(artists, 'find');
      req.query.ids = [String(artist._id), String(artist._id), null];
      await artistController.getArtists(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0].artists[0]).toEqual(
        res.json.mock.calls[0][0].artists[1]
      );
      expect(res.json.mock.calls[0][0].artists[2]).toEqual(undefined);
    });
  });
  describe('getAlbums', () => {
    it('Should return the albums in a paging object with status code 200', async () => {
      mockingoose(Album)
        .toReturn(
          [
            {
              artists: [{ _id: artist._id }]
            }
          ],
          'find'
        )
        .toReturn(1, 'countDocuments');
      req.params = { id: String(artist._id) };
      req.query = { offset: 0, limit: 20 };
      await artistController.getAlbums(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0].total).toBe(1);
    });
    it('Should return an empty array if no tracks are found', async () => {
      mockingoose(Album).toReturn([], 'find');
      req.params = { id: String(artist._id) };
      req.query = { offset: 0, limit: 20 };
      await artistController.getAlbums(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0].items).toEqual([]);
    });
  });
  describe('getPopularSongs', () => {
    it('Should return array of popular songs of the artist with status code 200', async () => {
      mockingoose(User).toReturn(artist, 'findOne');
      req.params = { id: artist._id };
      await artistController.getTracks(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0]).toHaveProperty('tracks');
    });
    it('Should throw an error with status code 404 if the artist was not found', async () => {
      mockingoose(User).toReturn(null, 'findOne');
      req.params = { id: artist._id };
      await artistController.getTracks(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('Should throw an error with status code 404 if the artist has no popular songs', async () => {
      artist.popularSongs = [];
      mockingoose(User).toReturn(artist, 'findOne');
      req.params = { id: artist._id };
      await artistController.getTracks(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  describe('relatedArtists', () => {
    it('Should return the list of artists with status code 200', async () => {
      mockingoose(User)
        .toReturn(artist, 'findOne')
        .toReturn(artists, 'find');
      req.params = { id: artist._id };
      await artistController.relatedArtists(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0]).toHaveProperty('artists');
    });
    it('Should throw an error with stats code 404 if the artist was not found', async () => {
      mockingoose(User)
        .toReturn(null, 'findOne')
        .toReturn(artists, 'find');
      req.params = { id: artist._id };
      await artistController.relatedArtists(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('Should return an empty array with status code 200 if the artist has no related artists', async () => {
      mockingoose(User)
        .toReturn(artist, 'findOne')
        .toReturn([], 'find');
      req.params = { id: artist._id };
      await artistController.relatedArtists(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
  });
  describe('updateArtist', () => {
    it('Should return updated artist if provided a valid bio', async () => {
      req.body = { bio: 'A valid bio' };
      artist.bio = req.body.bio;
      req.user = artist;
      mockingoose(Artist).toReturn(artist, 'save');
      await artistController.updateArtist(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0].artist).toMatchObject({
        bio: artist.bio
      });
    });
    it('Should return updated artist if provided a valid list of tracks', async () => {
      req.body = { tracks: artist.popularSongs };
      req.user = artist;
      mockingoose(Artist).toReturn(artist, 'save');
      mockingoose(Track).toReturn(artist.popularSongs, 'find');
      await artistController.updateArtist(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0].artist).toMatchObject({
        _id: artist._id
      });
    });
    it("Should throw an error with status code 400 if the tracks doesn't belong to this artist or doesn't exist", async () => {
      req.body = { tracks: artist.popularSongs };
      req.user = artist;
      mockingoose(Artist).toReturn(artist, 'save');
      mockingoose(Track).toReturn([], 'find');
      await artistController.updateArtist(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });
  });
  describe('Request functions', () => {
    let request;
    beforeEach(() => {
      request = new Request({
        displayName: 'Test artist',
        email: 'testing@gmail.com',
        name: 'test-man',
        genres: ['5e6c8ebb8b40fc5518fe8b32'],
        attachment: 'default.jpg',
        country: 'EG',
        popularSongs: trackIds,
        bio: 'I am not a real artist I am just here for testing.'
      });
    });
    describe('artistRequest', () => {
      it('Should return the id of the request with status code 200 if valid', async () => {
        mockingoose(Request).toReturn(request, 'save');
        mockingoose(Genre).toReturn(request.genres, 'find');
        req.body = {
          displayName: 'Test artist',
          email: 'testing@gmail.com',
          name: 'test-man',
          genres: ['5e6c8ebb8b40fc5518fe8b32'],
          attachment: 'default.jpg',
          country: 'EG',
          popularSongs: trackIds,
          bio: 'I am not a real artist I am just here for testing.'
        };
        await artistController.artistRequest(req, res, next);
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.json.mock.calls[0][0]).toMatchObject({ id: request._id });
      });
      it("Should throw an error with status code 400 if the genres doesn't exist", async () => {
        mockingoose(Request).toReturn(request, 'save');
        mockingoose(Genre).toReturn([], 'find');
        req.body = {
          displayName: 'Test artist',
          email: 'testing@gmail.com',
          name: 'test-man',
          genres: ['5e6c8ebb8b40fc5518fe8b32'],
          attachment: 'default.jpg',
          name: 'loool',
          popularSongs: trackIds,
          bio: 'I am not a real artist I am just here for testing.'
        };
        await artistController.artistRequest(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
      });
    });
    describe('setAttach', () => {
      it('Should return status code 204 if the request exist and the image is uploaded', async () => {
        req.file = 'path.jpg';
        mockingoose(Request).toReturn(request, 'findOne');
        await artistController.setAttach(req, res, next);
        expect(res.status.mock.calls[0][0]).toBe(204);
      });
      it('Should throw an error with status code 400 if the file was not uploaded', async () => {
        req.file = undefined;
        mockingoose(Request).toReturn(request, 'findOne');
        fs.unlink = jest.fn().mockResolvedValue();
        await artistController.setAttach(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(400);
      });
      it('Should throw an error with status code 404 if the request was not found', async () => {
        req.file = 'path.jpg';
        mockingoose(Request).toReturn(null, 'findOne');
        fs.unlink = jest.fn().mockResolvedValue();
        await artistController.setAttach(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(404);
      });
      it('Should throw an error with status code 403 if the request has an attachment', async () => {
        req.file = 'path.jpg';
        mockingoose(Request).toReturn(request, 'findOne');
        request.attachment = 'uploads\\requests\\oldpath.jpg';
        fs.unlink = jest.fn().mockResolvedValue();
        await artistController.setAttach(req, res, next);
        expect(next.mock.calls[0][0].statusCode).toBe(403);
      });
    });
  });
});
