const playerMocks = require('../../utils/models/player.model.mocks');
const deviceMocks = require('../../utils/models/device.model.mocks');
const userMocks = require('../../utils/models/user.model.mocks');
const requestMocks = require('../../utils/request.mock.js');
const { Player, Device } = require('../../../src/models');
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
    player.audioUrl = undefined;
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

  describe('Pause player', () => {
    let device;
    beforeEach(() => {
      player.save = jest.fn().mockResolvedValue(player);
      device = deviceMocks.createFakeDevice();
      mockingoose(Device).toReturn(device, 'findOne');
      req.query.deviceId = device._id;
    });
    it('it should return 500 status code if not authenticated', async () => {
      req.user = null;
      await playerController.pausePlayer(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
    });

    it('should return 404 status if player is not found', async () => {
      mockingoose(Player).toReturn(null, 'findOne');
      await playerController.pausePlayer(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should return 404 status if device is not found', async () => {
      mockingoose(Device).toReturn(null, 'findOne');
      await playerController.pausePlayer(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should return 204 if valid', async () => {
      await playerController.pausePlayer(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(204);
    });

    it('should save the player', async () => {
      await playerController.pausePlayer(req, res, next);
      expect(player.save.mock.calls.length).toBe(1);
    });

    it('should change isPlaying to false', async () => {
      player.isPlaying = true;
      await playerController.pausePlayer(req, res, next);
      expect(player.isPlaying).toBe(false);
    });
  });

  describe('Resume player', () => {
    let device;
    let dummyId;
    beforeEach(() => {
      player.save = jest.fn().mockResolvedValue(player);
      device = deviceMocks.createFakeDevice();
      mockingoose(Device).toReturn(device, 'findOne');
      req.query.deviceId = device._id;
      req.query.queueIndex = 0;
      dummyId = req.user._id;
      req.body.uris = [`oud:track:${dummyId}`];
      req.body.offset = {};
      req.body.positionMs = 1;
      req.body.contextUri = [`oud:playlist:${dummyId}`];
    });

    it('it should return 500 status code if not authenticated', async () => {
      req.user = null;
      await playerController.resumePlayer(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
    });

    it('should return 404 status if player is not found', async () => {
      mockingoose(Player).toReturn(null, 'findOne');
      await playerController.resumePlayer(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should return 404 status if device is not found', async () => {
      mockingoose(Device).toReturn(null, 'findOne');
      await playerController.resumePlayer(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should return 204 if valid', async () => {
      await playerController.resumePlayer(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(204);
    });

    it('should save the player', async () => {
      await playerController.resumePlayer(req, res, next);
      expect(player.save.mock.calls.length).toBe(1);
    });

    it('should change isPlaying to true', async () => {
      player.isPlaying = false;
      await playerController.resumePlayer(req, res, next);
      expect(player.isPlaying).toBe(true);
    });

    it('should change player positionMs if passed', async () => {
      player.positionMs = 0;
      await playerController.resumePlayer(req, res, next);
      expect(player.positionMs).toBe(req.body.positionMs);
    });
  });

  describe('Seek player', () => {
    beforeEach(() => {
      player.save = jest.fn().mockResolvedValue(player);
      device = deviceMocks.createFakeDevice();
      mockingoose(Device).toReturn(device, 'findOne');
      req.query.deviceId = device._id;
      req.query.positionMs = 1;
    });

    it('it should return 500 status code if not authenticated', async () => {
      req.user = null;
      await playerController.seekPlayer(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
    });

    it('should return 404 status if player is not found', async () => {
      mockingoose(Player).toReturn(null, 'findOne');
      await playerController.seekPlayer(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should return 404 status if device is not found', async () => {
      mockingoose(Device).toReturn(null, 'findOne');
      await playerController.seekPlayer(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should return 204 if valid', async () => {
      await playerController.seekPlayer(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(204);
    });

    it('should save the player', async () => {
      await playerController.seekPlayer(req, res, next);
      expect(player.save.mock.calls.length).toBe(1);
    });

    it('should change player positionMs', async () => {
      player.positionMs = 0;
      await playerController.seekPlayer(req, res, next);
      expect(player.positionMs).toBe(req.query.positionMs);
    });
  });
});