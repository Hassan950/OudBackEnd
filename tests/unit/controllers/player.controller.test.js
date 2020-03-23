const playerMocks = require('../../utils/models/player.model.mocks');
const userMocks = require('../../utils/models/user.model.mocks');
const requestMocks = require('../../utils/request.mock.js');
const { Player } = require('../../../src/models');
const { playerController } = require('../../../src/controllers');
const mockingoose = require('mockingoose').default;

describe('Player controller', () => {
  let player;
  let user;
  let req;
  let res;
  let next;
  beforeEach(() => {
    player = playerMocks.createFakePlayer();
    user = userMocks.createFakeUser();
    req = requestMocks.mockRequest(player);
    req.user = user;
    res = requestMocks.mockResponse();
    next = jest.fn();
    mockingoose(Player).toReturn(player, 'findOne');
  });

  describe('Get player', () => {
    it('it should return 500 status code if not authenticated', async () => {
      req.user = null;
      await playerController.getPlayer(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
    });

    it('shoud return 204 if player is null', async () => {
      mockingoose(Player).toReturn(null, 'findOne');
      await playerController.getPlayer(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(204);
    });

    it('should return 200 if valid', async () => {
      await playerController.getPlayer(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });

    it('should return player if valid', async () => {
      await playerController.getPlayer(req, res, next);
      expect(res.json.mock.calls[0][0].player).toEqual(player);
    });
  });

  describe('Get currently playing', () => {
    it('it should return 500 status code if not authenticated', async () => {
      req.user = null;
      await playerController.getCurrentlyPlaying(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
    });

    it('should return 200 if valid', async () => {
      await playerController.getCurrentlyPlaying(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });

    it('shoud return 204 if player is null', async () => {
      mockingoose(Player).toReturn(null, 'findOne');
      await playerController.getCurrentlyPlaying(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(204);
    });

    it('should return context if valid', async () => {
      await playerController.getCurrentlyPlaying(req, res, next);
      expect(res.json.mock.calls[0][0].context).toEqual(player.context);
    });

    it('should return track if valid', async () => {
      await playerController.getCurrentlyPlaying(req, res, next);
      expect(res.json.mock.calls[0][0].track).toEqual(player.item);
    });
  });
});