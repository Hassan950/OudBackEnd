const playHistoryMocks = require('../../utils/models/playHistory.model.mocks');
const userMocks = require('../../utils/models/user.model.mocks');
const requestMocks = require('../../utils/request.mock.js');
const { PlayHistory } = require('../../../src/models');
const { playHistoryController } = require('../../../src/controllers');
const mockingoose = require('mockingoose').default;

describe('PlayHistory controller', () => {
  let playHistory;
  let user;
  let req;
  let next;
  let res;
  beforeEach(() => {
    playHistory = playHistoryMocks.createFakePlayHistory();
    user = userMocks.createFakeUser();
    req = requestMocks.mockRequest(playHistory);
    req.user = user;
    req.query = {
      limit: 20,
      after: null,
      before: null
    };
    res = requestMocks.mockResponse();
    next = jest.fn();
    mockingoose(PlayHistory).toReturn([playHistory]);
  });

  describe('Recently Played', () => {
    it('it should return 500 status code if not authenticated', async () => {
      req.user = null;
      await playHistoryController.recentlyPlayed(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
    });

    it('should return 400 status code if after and before defined together', async () => {
      req.query.after = 1;
      req.query.before = 1;
      await playHistoryController.recentlyPlayed(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    it('should return 200 with items and limit if passed else 20', async () => {
      await playHistoryController.recentlyPlayed(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0].limit).toBe(req.query.limit || 20);
      expect(res.json.mock.calls[0][0].items.length).toBe(1);
    });

    it('should return 204 if history is null or empty', async () => {
      const args = [null, []];
      args.forEach(async element => {
        mockingoose(PlayHistory).toReturn(element);
        await playHistoryController.recentlyPlayed(req, res, next);
        expect(res.status.mock.calls[0][0]).toBe(204);
      });
    });

    it('should be valid if after is passed', async () => {
      req.query.after = 1;
      await playHistoryController.recentlyPlayed(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0].limit).toBe(req.query.limit || 20);
      expect(res.json.mock.calls[0][0].items.length).toBe(1);
    });

    it('should be valid if before is passed', async () => {
      req.query.before = 1;
      await playHistoryController.recentlyPlayed(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0].limit).toBe(req.query.limit || 20);
      expect(res.json.mock.calls[0][0].items.length).toBe(1);
    });
  });
});