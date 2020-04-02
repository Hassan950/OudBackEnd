const userMocks = require('../../utils/models/user.model.mocks');
const playerMocks = require('../../utils/models/player.model.mocks');
const queueMocks = require('../../utils/models/queue.model.mocks');
const deviceMocks = require('../../utils/models/device.model.mocks');
const requestMocks = require('../../utils/request.mock.js');
const { Queue, User, Player, Device } = require('../../../src/models');
const { queueController } = require('../../../src/controllers');
const mockingoose = require('mockingoose').default;

describe('Queue controller', () => {
  let user;
  let player;
  let device;
  let queue;
  let req;
  let res;
  let next;
  beforeEach(() => {
    player = playerMocks.createFakePlayer();
    player.audioUrl = undefined;
    user = userMocks.createFakeUser();
    queue = queueMocks.createFakeQueue();
    req = requestMocks.mockRequest();
    req.user = user;
    res = requestMocks.mockResponse();
    next = jest.fn();
    mockingoose(Queue).toReturn(queue, 'findOne');
    mockingoose(Player).toReturn(player, 'findOne');
  });

  describe('Get user queue', () => {
    beforeEach(() => {
      req.query.queueIndex = 0;
      User.findById = jest.fn().mockImplementationOnce(() => (
        { select: jest.fn().mockResolvedValueOnce([queue._id]) }
      ));
    });

    it('should return 500 status code if not authenticated', async () => {
      req.user = null;
      await queueController.getQueue(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
    });

    it('should return 400 if queues is null', async () => {
      User.findById = jest.fn().mockImplementationOnce(() => (
        { select: jest.fn().mockResolvedValueOnce(null) }
      ));
      await queueController.getQueue(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    it('should return 400 if no queue with the given index', async () => {
      req.query.queueIndex = 2;
      await queueController.getQueue(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    it('should return 204 if queue is null', async () => {
      mockingoose(Queue).toReturn(null, 'findOne');
      await queueController.getQueue(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(204);
    });

    it('should return 204 if tracks is null', async () => {
      queue.tracks = null;
      await queueController.getQueue(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(204);
    });

    it('should return 204 if tracks is empty', async () => {
      queue.tracks = [];
      await queueController.getQueue(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(204);
    });

    it('should return 200 with tracks and total if valid', async () => {
      await queueController.getQueue(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0].tracks).toBe(queue.tracks);
      expect(res.json.mock.calls[0][0].total).toBe(queue.tracks.length);
    });
  });

  describe('Repeat player', () => {
    beforeEach(() => {
      player.save = jest.fn().mockResolvedValue(player);
      device = deviceMocks.createFakeDevice();
      mockingoose(Device).toReturn(device, 'findOne');
      req.query.deviceId = device._id;
      req.query.state = 'context';
    });

    it('it should return 500 status code if not authenticated', async () => {
      req.user = null;
      await queueController.repeatQueue(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
    });

    it('should return 404 status if player is not found', async () => {
      mockingoose(Player).toReturn(null, 'findOne');
      await queueController.repeatQueue(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should return 404 status if device is not found', async () => {
      mockingoose(Device).toReturn(null, 'findOne');
      await queueController.repeatQueue(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should return 204 if valid', async () => {
      await queueController.repeatQueue(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(204);
    });

    it('should save the player', async () => {
      await queueController.repeatQueue(req, res, next);
      expect(player.save.mock.calls.length).toBe(1);
    });

    it('should change player state', async () => {
      player.positionMs = 0;
      await queueController.repeatQueue(req, res, next);
      expect(player.repeatState).toBe(req.query.state);
    });
  });
});