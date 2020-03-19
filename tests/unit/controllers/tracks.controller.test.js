const tracksController = require('../../../src/controllers/tracks.controller');
let { trackService } = require('../../../src/services');
const requestMocks = require('../../utils/request.mock');
let { Track } = require('../../../src/models');
const { TrackMocks } = require('../../utils/models/track.model.mocks');
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
      req.query.ids = '5e6c8ebb8b40fc5508fe8b32,5e6f6a7fac1d6d06f40706f2';
      await tracksController.getTracks(req, res, next);
      res.send.mock.calls[0][0].forEach(obj =>
        expect(obj).toMatchObject({ audioUrl: /.mp3/ })
      );
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it("Should throw an error with a status code of 404 if none of the ID's given matches an object", async () => {
      Track.find = TrackMocks.find;
      // two ID's that doesn't belong to any objects
      req.query.ids = '5e6c8ebb8b40fc5508fe7b32,5e6f6a7fac1d6d06f41706f2';
      expect(tracksController.getTracks(req, res, next)).rejects.toThrow(
        new AppError('The requested resource is not found', 404)
      );
    });
    it("Should return the same result for the same ID (null for invalid ID's)", async () => {
      Track.find = TrackMocks.find;
      // One valid ID and another invalid one each passed twice
      req.query.ids =
        '5e6c8ebb8b40fc5508fe8b32,5e6c8ebb8b40fc5508fe8b32,5e6c8ebb8b40fc5508fe8b31,5e6c8ebb8b40fc5508fe8b31';
      await tracksController.getTracks(req, res, next);
      expect(res.send.mock.calls[0][0][0]).toEqual(
        res.send.mock.calls[0][0][1]
      );
      expect(res.send.mock.calls[0][0][2]).toEqual(
        res.send.mock.calls[0][0][3]
      );
      expect(res.send.mock.calls[0][0][2]).toEqual(null);
    });
  });
  describe('deleteTrack', () => {
    it('Should delete the track with the given ID and return it with status code 200', async () => {
      Track.findByIdAndDelete = TrackMocks.findByIdAndDelete;
      // A valid ID that belongs to an object
      req.params.id = '5e6c8ebb8b40fc5518fe8b32';
      await tracksController.deleteTrack(req, res, next);
      expect(res.send.mock.calls[0][0]).toMatchObject({ audioUrl: /.mp3/ });
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it("Should throw an error with a status code of 404 if the ID didn't match any track", async () => {
      Track.findByIdAndDelete = TrackMocks.findByIdAndDelete;
      // An ID that doesn't belong to any track
      req.params.id = '5a6c8ebb8b40fc5518fe8b32';
      expect(tracksController.deleteTrack(req, res, next)).rejects.toThrow(
        new AppError('The requested resource is not found', 404)
      );
    });
  });
  describe('getTrack', () => {
    it('Should return the track with the given ID with status code of 200', async () => {
      Track.findById = TrackMocks.findById;
      req.params.id = '5e6c8ebb8b40fc5508fe8b32';
      await tracksController.getTrack(req, res, next);
      expect(res.send.mock.calls[0][0]).toMatchObject({ audioUrl: /.mp3/ });
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it("Should throw an error with a status code of 404 if the ID didn't match any track", () => {
      Track.findById = TrackMocks.findById;
      req.params.id = 'invalid id';
      expect(tracksController.getTrack(req, res, next)).rejects.toThrow(
        new AppError('The requested resource is not found', 404)
      );
    });
  });
  describe('updateTrack', () => {
    it('Should update the name of the track with the given ID with the name sent in the body of the request', async () => {
      Track.findByIdAndUpdate = TrackMocks.findByIdAndUpdate;
      // An ID of a track object
      req.params.id = '5e6c8ebb8b40fc5508fe8b32';
      req.body = {
        name: 'new Track'
      };
      await tracksController.updateTrack(req, res, next);
      expect(res.send.mock.calls[0][0]).toMatchObject({ name: 'new Track' });
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('Should update the list of artist IDs of the track with the given ID with the list given', async () => {
      Track.findByIdAndUpdate = TrackMocks.findByIdAndUpdate;
      // An ID of a track object
      req.params.id = '5e6c8ebb8b40fc5508fe8b32';
      req.body = {
        artists: ['new artist id', 'another new artist id']
      };
      await tracksController.updateTrack(req, res, next);
      expect(res.send.mock.calls[0][0]).toMatchObject({
        artists: ['new artist id', 'another new artist id']
      });
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('Should update the name and the list of artist IDs of the track with the given ID with the name and list given', async () => {
      Track.findByIdAndUpdate = TrackMocks.findByIdAndUpdate;
      // An ID of a track object
      req.params.id = '5e6c8ebb8b40fc5508fe8b32';
      req.body = {
        name: 'both are updated',
        artists: ['new artist id', 'another new artist id']
      };
      await tracksController.updateTrack(req, res, next);
      expect(res.send.mock.calls[0][0]).toMatchObject({
        name: 'both are updated',
        artists: ['new artist id', 'another new artist id']
      });
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it("Should throw an error with a status code of 404 if the ID didn't match any track", async () => {
      req.params.id = 'not a valid id';
      req.body = {
        artists: ['new artist id', 'another new artist id']
      };
      expect(tracksController.updateTrack(req, res, next)).rejects.toThrow(
        new AppError('The requested resource is not found', 404)
      );
    })
  });
});
