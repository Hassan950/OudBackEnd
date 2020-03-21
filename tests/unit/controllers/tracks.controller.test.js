const tracksController = require('../../../src/controllers/tracks.controller');
const requestMocks = require('../../utils/request.mock');
let { Track } = require('../../../src/models');
const { TrackMocks, artistids, trackids } = require('../../utils/models/track.model.mocks');
const AppError = require('../../../src/utils/AppError');

describe('Tracks controller', () => {
  let req;
  let res;
  let next;
  beforeEach(() => {
    req = { params: {}, query: {}, body: {} };
    res = requestMocks.mockResponse();
    next = jest.fn();
  });
  describe('getTracks', () => {
    it("Should return list of tracks with the ID's given with status code 200", async () => {
      Track.find = TrackMocks.find;
      // two valid ID's
      req.query.ids = trackids[0]+','+trackids[1];
      await tracksController.getTracks(req, res, next);
      expect(res.json.mock.calls[0][0]).toHaveProperty('tracks');
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it("Should throw an error with a status code of 404 if none of the ID's given matches an object", async () => {
      Track.find = TrackMocks.find;
      // two ID's that doesn't belong to any objects
      req.query.ids = 'valid id,another valid id';
      await expect(tracksController.getTracks(req, res, next)).rejects.toThrow(
        new AppError('The requested resource is not found', 404)
      );
    });
    it("Should return the same result for the same ID (null for invalid ID's)", async () => {
      Track.find = TrackMocks.find;
      // One valid ID and another invalid one each passed twice
      req.query.ids = trackids[0]+','+trackids[0]+',5e6c8ebb8b40fc5508fe8b31,5e6c8ebb8b40fc5508fe8b31';
      await tracksController.getTracks(req, res, next);
      expect(res.json.mock.calls[0][0].tracks[0]).toEqual(res.json.mock.calls[0][0].tracks[1]);
      expect(res.json.mock.calls[0][0].tracks[2]).toEqual(res.json.mock.calls[0][0].tracks[3]);
      expect(res.json.mock.calls[0][0].tracks[2]).toEqual(null);
    });
  });
  describe('deleteTrack', () => {
    it('Should delete the track with the given ID and return it with status code 200', async () => {
      Track.findByIdAndDelete = TrackMocks.findByIdAndDelete;
      Track.findById = TrackMocks.findById;
      // A valid ID that belongs to an object
      req.params.id = trackids[1];
      req.user = { artist: artistids[1] };
      await tracksController.deleteTrack(req, res, next);
      expect(res.json.mock.calls[0][0]).toHaveProperty('track');
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it("Should throw an error with a status code of 403 if the artist is not one of the track artists", async () => {
      Track.findByIdAndDelete = TrackMocks.findByIdAndDelete;
      // An ID that doesn't belong to any track
      req.params.id = trackids[0];
      req.user = { artist: artistids[2] };
      await expect(tracksController.deleteTrack(req, res, next)).rejects.toThrow(
        new AppError('You do not have permission to perform this action.', 403)
      );
    });
    it("Should throw an error with a status code of 404 if the ID didn't match any track", async () => {
      Track.findByIdAndDelete = TrackMocks.findByIdAndDelete;
      // An ID that doesn't belong to any track
      req.params.id = 'a track id that doesn\'nt belong to any';
      req.user = { artist: artistids[0] };
      await expect(tracksController.deleteTrack(req, res, next)).rejects.toThrow(
        new AppError('The requested resource is not found', 404)
      );
    });
  });
  describe('getTrack', () => {
    it('Should return the track with the given ID with status code of 200', async () => {
      Track.findById = TrackMocks.findById;
      req.params.id = trackids[0];
      await tracksController.getTrack(req, res, next);
      expect(res.json.mock.calls[0][0]).toHaveProperty('track');
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it("Should throw an error with a status code of 404 if the ID didn't match any track", async () => {
      Track.findById = TrackMocks.findById;
      req.params.id = 'valid id';
      await expect(tracksController.getTrack(req, res, next)).rejects.toThrow(
        new AppError('The requested resource is not found', 404)
      );
    });
  });
  describe('updateTrack', () => {
    it('Should update the name of the track with the given ID with the name sent in the body of the request', async () => {
      Track.findByIdAndUpdate = TrackMocks.findByIdAndUpdate;
      Track.findById = TrackMocks.findById;
      // An ID of a track object
      req.params.id = trackids[2];
      req.user = { artist: artistids[2] };
      req.body = {
        name: 'new Track'
      };
      await tracksController.updateTrack(req, res, next);
      expect(res.json.mock.calls[0][0]).toMatchObject({ track: { name: 'new Track' }});
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('Should update the list of artist IDs of the track with the given ID with the list given', async () => {
      Track.findByIdAndUpdate = TrackMocks.findByIdAndUpdate;
      Track.findById = TrackMocks.findById;
      // An ID of a track object
      req.params.id = trackids[0];
      req.user = { artist: artistids[0] };
      req.body = {
        artists: ['new artist id', 'another new artist id']
      };
      await tracksController.updateTrack(req, res, next);
      expect(res.json.mock.calls[0][0]).toMatchObject({ track:{
        artists: ['new artist id', 'another new artist id']
      }});
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('Should update the name and the list of artist IDs of the track with the given ID with the name and list given', async () => {
      Track.findByIdAndUpdate = TrackMocks.findByIdAndUpdate;
      Track.findById = TrackMocks.findById;
      // An ID of a track object
      req.params.id = trackids[2];
      req.user = { artist: artistids[2] };
      req.body = {
        name: 'both are updated',
        artists: [artistids[2], 'another new artist id']
      };
      await tracksController.updateTrack(req, res, next);
      expect(res.json.mock.calls[0][0]).toMatchObject({ track: {name: 'both are updated'}});
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it("Should throw an error with a status code of 403 if the artist ID is not one of the tracks artist ID's", async () => {
      req.params.id = trackids[2];
      req.user = { artist: artistids[0] };
      req.body = {
        artists: ['new artist id', 'another new artist id']
      };
      await expect(tracksController.updateTrack(req, res, next)).rejects.toThrow(
        new AppError('You do not have permission to perform this action.', 403)
      );
    });
    it("Should throw an error with a status code of 404 if the ID didn't match any track", async () => {
      req.params.id = 'a valid id';
      req.user = { artist: artistids[0] };
      req.body = {
        artists: ['new artist id', 'another new artist id']
      };
      await expect(tracksController.updateTrack(req, res, next)).rejects.toThrow(
        new AppError('The requested resource is not found', 404)
      );
    });
  });
});
