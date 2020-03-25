const { tracksController } = require('../../../src/controllers');
const requestMocks = require('../../utils/request.mock');
let { Track } = require('../../../src/models');
const mockingoose = require('mockingoose').default;

artistids = [
  '5e6c8ebb8b40fc5508fe8b32',
  '5e6c8ebb8b40fc6608fe8b32',
  '5e6c8ebb8b40fc7708fe8b32'
];
trackids = [
  '5e6c8ebb8b40fc5508fe8b32',
  '5e6f6a7fac1d6d06f40706f2',
  '5e6c8ebb8b40fc5518fe8b32'
];

const AppError = require('../../../src/utils/AppError');

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
      artists: artistids,
      album: '5e6c8ebb8b40fc7708fe8b32',
      duration: 21000
    });
    track.populate = jest.fn().mockReturnThis();
    track.select = jest.fn().mockReturnThis();
    tracks = [track, track];
    tracks.populate = jest.fn().mockReturnThis();
    tracks.select = jest.fn().mockReturnThis();
    req = { params: {}, query: {}, body: {} };
    res = requestMocks.mockResponse();
    next = jest.fn();
  });
  describe('getTracks', () => {
    it("Should return list of tracks with the ID's given with status code 200", async () => {
      tracks.populate = jest.fn().mockReturnThis();
      tracks.select = jest.fn().mockReturnThis();
      mockingoose(Track).toReturn(tracks, 'find');
      // two valid ID's
      req.query.ids = trackids[0] + ',' + trackids[1];
      await tracksController.getTracks(req, res, next);
      expect(res.json.mock.calls[0][0]).toHaveProperty('tracks');
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it("Should return an array of nulls if none of the ID's given matches an object", async () => {
      tracks.populate = jest.fn();
      mockingoose(Track).toReturn([], 'find');
      // two ID's that doesn't belong to any objects
      req.query.ids = 'valid id,another valid id';
      await tracksController.getTracks(req, res, next);
      expect(res.json.mock.calls[0][0].tracks).toMatchObject([null, null]);
    });
    it("Should return the same result for the same ID (null for invalid ID's)", async () => {
      tracks.populate = jest.fn();
      track._id = trackids[0];
      tracks = [track];
      mockingoose(Track).toReturn(tracks, 'find');
      // One valid ID and another invalid one each passed twice
      req.query.ids =
        trackids[0] +
        ',' +
        trackids[0] +
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
      track.populate = jest.fn();
      track.artists[0] = artistids[1];
      // A valid ID that belongs to an object
      req.params.id = trackids[1];
      req.user = { artist: artistids[1] };
      await tracksController.deleteTrack(req, res, next);
      expect(res.json.mock.calls[0][0]).toHaveProperty('track');
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('Should throw an error with a status code of 403 if the artist is not one of the track artists', async () => {
      // An ID that doesn't belong to any track
      mockingoose(Track)
        .toReturn(track, 'findOneAndDelete')
        .toReturn(track, 'findOne');
      track.populate = jest.fn().mockReturnThis();
      track.select = jest.fn().mockReturnThis();
      req.params.id = trackids[0];
      req.user = { artist: artistids[2] };
      await expect(
        tracksController.deleteTrack(req, res, next)
      ).rejects.toThrow(
        new AppError('You do not have permission to perform this action.', 403)
      );
    });
    it("Should throw an error with a status code of 404 if the ID didn't match any track", async () => {
      mockingoose(Track)
        .toReturn(track, 'findOneAndDelete')
        .toReturn(null, 'findOne');
      // An ID that doesn't belong to any track
      req.params.id = "a track id that doesn'nt belong to any";
      req.user = { artist: artistids[0] };
      await expect(
        tracksController.deleteTrack(req, res, next)
      ).rejects.toThrow(
        new AppError('The requested resource is not found', 404)
      );
    });
  });
  describe('getTrack', () => {
    it('Should return the track with the given ID with status code of 200', async () => {
      mockingoose(Track).toReturn(track, 'findOne');
      req.params.id = trackids[0];
      await tracksController.getTrack(req, res, next);
      expect(res.json.mock.calls[0][0]).toHaveProperty('track');
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it("Should throw an error with a status code of 404 if the ID didn't match any track", async () => {
      mockingoose(Track).toReturn(null, 'findOne');
      req.params.id = 'valid id';
      await expect(tracksController.getTrack(req, res, next)).rejects.toThrow(
        new AppError('The requested resource is not found', 404)
      );
    });
  });
  describe('updateTrack', () => {
    it('Should update the name of the track with the given ID with the name sent in the body of the request', async () => {
      track.populate = jest.fn();
      mockingoose(Track)
        .toReturn(track, 'findOne')
        .toReturn(track, 'findOneAndUpdate');
      track.artists[0] = artistids[2];
      // An ID of a track object
      req.params.id = trackids[2];
      req.user = { artist: artistids[2] };
      req.body = {
        name: 'new Track'
      };
      await tracksController.updateTrack(req, res, next);
      expect(res.json.mock.calls[0][0]).toMatchObject({
        track: { name: 'new Track' }
      });
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('Should update the list of artist IDs of the track with the given ID with the list given', async () => {
      track.populate = jest.fn();
      mockingoose(Track)
        .toReturn(track, 'findOne')
        .toReturn(track, 'findOneAndUpdate');
      track.artists[0] = artistids[0];
      // An ID of a track object
      req.params.id = trackids[0];
      req.user = { artist: artistids[0] };
      req.body = {
        artists: [artistids[0], artistids[1]]
      };
      await tracksController.updateTrack(req, res, next);
      expect(res.json.mock.calls[0][0].track.artists.toString()).toEqual(
        artistids[0] + ',' + artistids[1]
      );
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('Should update the name and the list of artist IDs of the track with the given ID with the name and list given', async () => {
      track.populate = jest.fn();
      mockingoose(Track)
        .toReturn(track, 'findOne')
        .toReturn(track, 'findOneAndUpdate');
      track.artists[0] = artistids[2];
      // An ID of a track object
      req.params.id = trackids[2];
      req.user = { artist: artistids[2] };
      req.body = {
        name: 'both are updated',
        artists: [artistids[2], artistids[1]]
      };
      await tracksController.updateTrack(req, res, next);
      expect(res.json.mock.calls[0][0]).toMatchObject({
        track: { name: 'both are updated' }
      });
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it("Should throw an error with a status code of 403 if the artist ID is not one of the tracks artist ID's", async () => {
      track.populate = jest.fn();
      mockingoose(Track)
        .toReturn(track, 'findOne')
        .toReturn(track, 'findOneAndUpdate');
      track.artists[0] = artistids[2];
      req.params.id = trackids[2];
      req.user = { artist: artistids[0] };
      req.body = {
        artists: ['new artist id', 'another new artist id']
      };
      await expect(
        tracksController.updateTrack(req, res, next)
      ).rejects.toThrow(
        new AppError('You do not have permission to perform this action.', 403)
      );
    });
    it("Should throw an error with a status code of 404 if the ID didn't match any track", async () => {
      track.populate = jest.fn();
      mockingoose(Track)
        .toReturn(null, 'findOne')
        .toReturn(null, 'findOneAndUpdate');
      track.artists[0] = artistids[2];
      req.params.id = 'a valid id';
      req.user = { artist: artistids[0] };
      req.body = {
        artists: ['new artist id', 'another new artist id']
      };
      await expect(
        tracksController.updateTrack(req, res, next)
      ).rejects.toThrow(
        new AppError('The requested resource is not found', 404)
      );
    });
  });
});
