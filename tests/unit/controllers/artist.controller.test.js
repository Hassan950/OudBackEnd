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
      expect(res.json.mock.calls[0][0]).toHaveProperty('artist');
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
});
