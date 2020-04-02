const { tracksController } = require('../../../src/controllers');
const requestMocks = require('../../utils/request.mock');
let { Track, Artist, Genre } = require('../../../src/models');
const mockingoose = require('mockingoose').default;
let fs = require('fs').promises;
jest.mock('get-mp3-duration', () => () => 21000);

artistIds = [
  { _id: '5e6c8ebb8b40fc5508fe8b32' },
  { _id: '5e6c8ebb8b40fc6608fe8b32' },
  { _id: '5e6c8ebb8b40fc7708fe8b32' }
];
trackIds = [
  '5e6c8ebb8b40fc5508fe8b32',
  '5e6f6a7fac1d6d06f40706f2',
  '5e6c8ebb8b40fc5518fe8b32'
];

describe('Tracks controller', () => {
  let req;
  let res;
  let next;
  let track;
  let tracks;
  beforeEach(() => {
    track = new Track({
      name: 'mohamed',
      audioUrl: 'lol.mp3',
      artists: artistIds,
      album: '5e6c8ebb8b40fc7708fe8b32',
      duration: 21000
    });
    tracks = [track, track];
    req = { params: {}, query: {}, body: {} };
    res = requestMocks.mockResponse();
    next = jest.fn();
  });
  describe('getTracks', () => {
    it("Should return list of tracks with the ID's given with status code 200", async () => {
      mockingoose(Track).toReturn(tracks, 'find');
      // two valid ID's
      req.query.ids = trackIds[0] + ',' + trackIds[1];
      await tracksController.getTracks(req, res, next);
      expect(res.json.mock.calls[0][0]).toHaveProperty('tracks');
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it("Should return an array of nulls if none of the ID's given matches an object", async () => {
      mockingoose(Track).toReturn([], 'find');
      // two ID's that doesn't belong to any objects
      req.query.ids = ['valid id', 'another valid id'];
      await tracksController.getTracks(req, res, next);
      expect(res.json.mock.calls[0][0].tracks).toMatchObject([null, null]);
    });
    it("Should return the same result for the same ID (null for invalid ID's)", async () => {
      track._id = trackIds[0];
      tracks = [track];
      mockingoose(Track).toReturn(tracks, 'find');
      // One valid ID and another invalid one each passed twice
      req.query.ids =
        trackIds[0] +
        ',' +
        trackIds[0] +
        ',5e6c8ebb8b40fc5508fe8b31,5e6c8ebb8b40fc5508fe8b31';
      await tracksController.getTracks(req, res, next);
      result = res.json.mock.calls;
      expect(result[0][0].tracks[0]).toEqual(result[0][0].tracks[1]);
      expect(result[0][0].tracks[2]).toEqual(result[0][0].tracks[3]);
      expect(result[0][0].tracks[2]).toEqual(null);
    });
  });
  describe('deleteTrack', () => {
    it('Should delete the track with the given ID and return it with status code 200', async () => {
      mockingoose(Track)
        .toReturn(track, 'findOneAndDelete')
        .toReturn(track, 'findOne');
      fs.unlink = jest.fn();
      mockingoose(Artist).toReturn(track.artists, 'find');
      track.artists[0] = artistIds[1];
      // A valid ID that belongs to an object
      req.params.id = trackIds[1];
      req.user = { artist: artistIds[1]._id };
      await tracksController.deleteTrack(req, res, next);
      expect(res.json.mock.calls[0][0]).toMatchObject(track);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('Should throw an error with a status code of 403 if the artist is not one of the track artists', async () => {
      // An ID that doesn't belong to any track
      mockingoose(Track)
        .toReturn(track, 'findOneAndDelete')
        .toReturn(track, 'findOne');
      req.params.id = trackIds[0];
      req.user = { artist: artistIds[2]._id }; // The right artist is artist[0]
      await tracksController.deleteTrack(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
    it("Should throw an error with a status code of 404 if the ID didn't match any track", async () => {
      mockingoose(Track)
        .toReturn(track, 'findOneAndDelete')
        .toReturn(null, 'findOne');
      // An ID that doesn't belong to any track
      req.params.id = "a track id that doesn'nt belong to any";
      req.user = { artist: artistIds[0]._id };
      await tracksController.deleteTrack(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  describe('getTrack', () => {
    it('Should return the track with the given ID with status code of 200', async () => {
      mockingoose(Track).toReturn(track, 'findOne');
      req.params.id = trackIds[0];
      await tracksController.getTrack(req, res, next);
      expect(res.json.mock.calls[0][0]).toMatchObject(track);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it("Should throw an error with a status code of 404 if the ID didn't match any track", async () => {
      mockingoose(Track).toReturn(null, 'findOne');
      req.params.id = 'valid id';
      await tracksController.getTrack(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  describe('updateTrack', () => {
    it('Should update the name of the track with the given ID with the name sent in the body of the request', async () => {
      track.name = 'new Track';
      mockingoose(Track)
        .toReturn(track, 'findOne')
        .toReturn(track, 'findOneAndUpdate');
      track.artists[0] = artistIds[2];
      // An ID of a track object
      req.params.id = trackIds[2];
      req.user = { artist: artistIds[2]._id };
      req.body = {
        name: 'new Track'
      };
      await tracksController.updateTrack(req, res, next);
      expect(res.json.mock.calls[0][0]).toMatchObject(track);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('Should update the list of artist IDs of the track with the given ID with the list given', async () => {
      mockingoose(Track)
        .toReturn(track, 'findOne')
        .toReturn(track, 'findOneAndUpdate');
      // An ID of a track object
      mockingoose(Artist).toReturn(track.artists, 'find');
      req.params.id = trackIds[0];
      req.user = { artist: artistIds[0]._id };
      req.body = {
        artists: track.artists
      };
      await tracksController.updateTrack(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('Should update the name and the list of artist IDs of the track with the given ID with the name and list given', async () => {
      mockingoose(Track)
        .toReturn(track, 'findOne')
        .toReturn(track, 'findOneAndUpdate');
      mockingoose(Artist).toReturn(track.artists, 'find');
      track.artists[0] = artistIds[2];
      // An ID of a track object
      req.params.id = trackIds[2];
      req.user = { artist: artistIds[2]._id };
      req.body = {
        name: 'both are updated',
        artists: track.artists
      };
      await tracksController.updateTrack(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it("Should throw an error with a status code of 403 if the artist ID is not one of the tracks artist ID's", async () => {
      mockingoose(Track)
        .toReturn(track, 'findOne')
        .toReturn(track, 'findOneAndUpdate');
      track.artists[0] = artistIds[2];
      req.params.id = trackIds[2];
      req.user = { artist: artistIds[0]._id };
      req.body = {
        artists: ['new artist id', 'another new artist id']
      };
      await tracksController.updateTrack(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
    it("Should throw an error with a status code of 404 if the ID didn't match any track", async () => {
      mockingoose(Track)
        .toReturn(null, 'findOne')
        .toReturn(null, 'findOneAndUpdate');
      track.artists[0] = artistIds[2];
      req.params.id = 'a valid id';
      req.user = { artist: artistIds[0] };
      req.body = {
        artists: ['new artist id', 'another new artist id']
      };
      await tracksController.updateTrack(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  describe('setTrack', () => {
    it('Should return album with new path with status code 200', async () => {
      mockingoose(Track)
        .toReturn(track, 'findOne')
        .toReturn(track, 'save');
      req.user = { artist: track.artists[0]._id };
      req.params.id = track._id;
      req.file = {
        path: 'lol.mp3'
      };
      fs.unlink = jest.fn().mockResolvedValue();
      fs.readFile = jest.fn();
      await tracksController.setTrack(req, res, next);
      expect(res.json.mock.calls[0][0]).toHaveProperty('name');
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('Should throw an error with status code 404 if the track was not found', async () => {
      mockingoose(Track)
        .toReturn(null, 'findOne')
        .toReturn(null, 'save');
      req.user = { artist: track.artists[0]._id };
      req.params.id = track._id;
      req.file = {
        path: 'lol.mp3'
      };
      fs.unlink = jest.fn().mockResolvedValue();
      fs.readFile = jest.fn();
      await tracksController.setTrack(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it("Should throw an error with status code 403 if the user is not the track's main artist", async () => {
      mockingoose(Track)
        .toReturn(track, 'findOne')
        .toReturn(track, 'save');
      req.user = { artist: track.artists[1]._id };
      req.params.id = track._id;
      req.file = {
        path: 'lol.mp3'
      };
      fs.unlink = jest.fn();
      fs.readFile = jest.fn();
      await tracksController.setTrack(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
  });
});
