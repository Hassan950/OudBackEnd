const deviceMocks = require('../../utils/models/device.model.mocks');
const playerMocks = require('../../utils/models/player.model.mocks');
const userMocks = require('../../utils/models/user.model.mocks');
const requestMocks = require('../../utils/request.mock.js');
const { Device, Player } = require('../../../src/models');
const { deviceController } = require('../../../src/controllers');
const mockingoose = require('mockingoose').default;

describe('Device controller', () => {
  let device;
  let user;
  let req;
  let res;
  let next;
  beforeEach(() => {
    device = deviceMocks.createFakeDevice();
    user = userMocks.createFakeUser();
    req = requestMocks.mockRequest(device);
    req.user = user;
    res = requestMocks.mockResponse();
    next = jest.fn();
    mockingoose(Device).toReturn([device]);
  });

  describe('Get user available devices', () => {
    it('should return 500 status code if not authenticated', async () => {
      req.user = null;
      await deviceController.getUserDevices(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
    });

    it('should return 200 status code if valid', async () => {
      await deviceController.getUserDevices(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });

    it('should return array of devices if valid', async () => {
      await deviceController.getUserDevices(req, res, next);
      expect(res.json.mock.calls[0][0].devices).toEqual([device]);
    });
  });

  describe('Transfer device', () => {
    beforeEach(() => {
      req.body.deviceIds = [device._id];
      req.body.play = true;
      player = playerMocks.createFakePlayer();
      player.save = jest.fn().mockResolvedValue(player);
      mockingoose(Player).toReturn(player, 'findOne');
      mockingoose(Device).toReturn(device, 'findOne');
    });
    it('should return 500 status code if not authenticated', async () => {
      req.user = null;
      await deviceController.transferPlayback(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
    });

    it('should return 404 status if player is not found', async () => {
      mockingoose(Player).toReturn(null, 'findOne');
      await deviceController.transferPlayback(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should return 404 status if device is not found', async () => {
      mockingoose(Device).toReturn(null, 'findOne');
      await deviceController.transferPlayback(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should return 204 if valid', async () => {
      await deviceController.transferPlayback(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(204);
    });

    it('should save the player', async () => {
      await deviceController.transferPlayback(req, res, next);
      expect(player.save.mock.calls.length).toBe(1);
    });

    it('should change isPlaying to true if play is true', async () => {
      player.isPlaying = false;
      await deviceController.transferPlayback(req, res, next);
      expect(player.isPlaying).toBe(true);
    });
  });

  describe('Set volume', () => {
    beforeEach(() => {
      device.save = jest.fn().mockResolvedValue(device);
      device.userId = req.user._id;
      req.query.deviceId = device._id;
      req.query.volumePercent = 1;
      player = playerMocks.createFakePlayer();
      mockingoose(Player).toReturn(player, 'findOne');
      mockingoose(Device).toReturn(device, 'findOne');
    });

    it('should return 500 status code if not authenticated', async () => {
      req.user = null;
      await deviceController.setVolume(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
    });

    it('should return 404 status if player is not found and deviceId is null', async () => {
      req.query.deviceId = null;
      mockingoose(Player).toReturn(null, 'findOne');
      await deviceController.setVolume(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should return 404 status if device is not found', async () => {
      mockingoose(Device).toReturn(null, 'findOne');
      await deviceController.setVolume(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should return 404 status if device.userId != req.user._id', async () => {
      device.userId = null;
      await deviceController.setVolume(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should save the device', async () => {
      await deviceController.setVolume(req, res, next);
      expect(device.save.mock.calls.length).toBe(1);
    });

    it('should return 204 if valid', async () => {
      await deviceController.setVolume(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(204);
    });

    it('should change volumePercent', async () => {
      device.volumePercent = 0;
      await deviceController.setVolume(req, res, next);
      expect(device.volumePercent).toBe(req.query.volumePercent);
    });

    it('should use player device if deviceId is not passed', async () => {
      req.query.deviceId = null;
      await deviceController.setVolume(req, res, next);
      expect(device.save.mock.calls.length).toBe(1);
      expect(res.status.mock.calls[0][0]).toBe(204);
      expect(device.volumePercent).toBe(req.query.volumePercent);
    });
  });
});