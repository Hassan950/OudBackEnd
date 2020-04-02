const { artistController } = require('../../../src/controllers');
const mockingoose = require('mockingoose').default;
const requestMocks = require('../../utils/request.mock');
const { Artist, Track, Album } = require('../../../src/models');

trackIds = [
  '5e6c8ebb8b40fc5508fe8b32',
  '5e6f6a7fac1d6d06f40706f2',
  '5e6c8ebb8b40fc5518fe8b32'
];

describe('Artists Controller', () => {
  let req;
  let res;
  let next;
  let artist;
  let artists;
  beforeEach(() => {
    artist = new Artist({
      user: '5e6c8ebb8b40fc5518fe8b32',
      genres: ['5e6c8ebb8b40fc5518fe8b32'],
      images: ['lol.jpg', 'default.png'],
      name: 'loool',
      popularSongs: trackIds
    });
    artists = [artist, artist];
    req = { params: {}, query: {}, body: {} };
    res = requestMocks.mockResponse();
    next = jest.fn();
  });
  describe('getArtist', () => {
    it('Should return the artist with status code 200', async () => {
      mockingoose(Artist).toReturn(artist, 'findOne');
      await artistController.getArtist(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0]).toMatchObject(artist);
    });
    it('Should throw an error with status code 404 if the artist is not found', async () => {
      mockingoose(Artist).toReturn(null, 'findOne');
      await artistController.getArtist(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  describe('getArtists', () => {
    it("Should return the artists with nulls against unmatched ID's with status code 200", async () => {
      mockingoose(Artist).toReturn(artists, 'find');
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
      mockingoose(Album).toReturn(
        [
          {
            artists: [{ _id: artist._id }]
          }
        ],
        'find'
      );
      req.params = { id: String(artist._id) };
      req.query = { offset: 0, limit: 20 };
      await artistController.getAlbums(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0].total).toBe(1);
    });
    it('Should throw an error with status code 404 if no tracks are found', async () => {
      mockingoose(Album).toReturn(null, 'find');
      req.params = { id: String(artist._id) };
      req.query = { offset: 0, limit: 20 };
      await artistController.getAlbums(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  describe('getPopularSongs', () => {
    it('Should return array of popular songs of the artist with status code 200', async () => {
      mockingoose(Artist).toReturn(
        {
          popularSongs: artist.popularSongs
        },
        'findOne'
      );
      req.params = { id: artist._id };
      await artistController.getTracks(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0]).toHaveProperty('tracks');
    });
    it('Should throw an error with status code 404 if the artist was not found', async () => {
      mockingoose(Artist).toReturn(null, 'findOne');
      req.params = { id: artist._id };
      await artistController.getTracks(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('Should throw an error with status code 404 if the artist has no popular songs', async () => {
      artist.popularSongs = [];
      mockingoose(Artist).toReturn(artist, 'findOne');
      req.params = { id: artist._id };
      await artistController.getTracks(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  describe('relatedArtists', () => {
    it('Should return the list of artists with status code 200', async () => {
      mockingoose(Artist)
        .toReturn(artist, 'findOne')
        .toReturn(artists, 'find');
      req.params = { id: artist._id };
      await artistController.relatedArtists(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0]).toHaveProperty('artists');
    });
    it('Should throw an error with stats code 404 if the artist was not found', async () => {
      mockingoose(Artist)
        .toReturn(null, 'findOne')
        .toReturn(artists, 'find');
      req.params = { id: artist._id };
      await artistController.relatedArtists(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('Should return an empty array with status code 200 if the artist has no related artists', async () => {
      mockingoose(Artist)
        .toReturn(artist, 'findOne')
        .toReturn([], 'find');
      req.params = { id: artist._id };
      await artistController.relatedArtists(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    })
  });
});
