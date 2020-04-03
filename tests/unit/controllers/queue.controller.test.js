const userMocks = require('../../utils/models/user.model.mocks');
const playerMocks = require('../../utils/models/player.model.mocks');
const queueMocks = require('../../utils/models/queue.model.mocks');
const deviceMocks = require('../../utils/models/device.model.mocks');
const requestMocks = require('../../utils/request.mock.js');
const { Queue, User, Player, Device, Track } = require('../../../src/models');
const { queueController } = require('../../../src/controllers');
const mockingoose = require('mockingoose').default;
const faker = require('faker');

function randomArray(min, max) {
  const len = faker.random.number({ min, max });
  const array = []

  for (let i = 0; i < len; ++i) {
    array[i] = faker.random.number();
  }

  return array;
};


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

  describe('Add to queue', () => {
    beforeEach(() => {
      player.save = jest.fn().mockResolvedValue(player);
      device = deviceMocks.createFakeDevice();
      mockingoose(Device).toReturn(device, 'findOne');
      User.findById = jest.fn().mockImplementationOnce(() => (
        { select: jest.fn().mockResolvedValueOnce([queue._id]) }
      ));
      track = new Track({
        name: 'song',
        audioUrl: 'song.mp3',
        artists: [
          '5e6c8ebb8b40fc5508fe8b32',
          '5e6c8ebb8b40fc6608fe8b32',
          '5e6c8ebb8b40fc7708fe8b32'
        ],
        album: '5e6c8ebb8b40fc7708fe8b32',
        duration: 21000
      });
      req.query.queueIndex = 0;
      req.query.deviceId = device._id;
      req.query.trackId = track._id;
      mockingoose(Track)
        .toReturn(track, 'findOne');
    });

    it('it should return 500 status code if not authenticated', async () => {
      req.user = null;
      await queueController.addToQueue(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
    });

    it('should return 404 status if player is not found', async () => {
      mockingoose(Player).toReturn(null, 'findOne');
      await queueController.addToQueue(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should return 404 status if device is not found', async () => {
      mockingoose(Device).toReturn(null, 'findOne');
      await queueController.addToQueue(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should return 404 if queues is null', async () => {
      User.findById = jest.fn().mockImplementationOnce(() => (
        { select: jest.fn().mockResolvedValueOnce(null) }
      ));
      await queueController.addToQueue(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should return 404 if queues is empty', async () => {
      User.findById = jest.fn().mockImplementationOnce(() => (
        { select: jest.fn().mockResolvedValueOnce([]) }
      ));
      await queueController.addToQueue(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should return 400 if queueIndex=1 and queues.length<2', async () => {
      req.query.queueIndex = 1;
      await queueController.addToQueue(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    it('should revese queues if queues.length>1 and queueIndex=1', async () => {
      req.query.queueIndex = 1;
      const queues = randomArray(2, 10);
      User.findById = jest.fn().mockImplementationOnce(() => (
        { select: jest.fn().mockResolvedValueOnce(queues) }
      ));
      await queueController.addToQueue(req, res, next);
      expect(queues).toEqual(queues.reverse());
    });

    it('should save player if deviceId is valid and passed', async () => {
      await queueController.addToQueue(req, res, next);
      expect(player.save.mock.calls.length).toBe(1);
    });

    it('should assign deviceId to player.device if deviceId is valid and passed', async () => {
      await queueController.addToQueue(req, res, next);
      expect(player.device).toBe(req.query.deviceId);
    });

    it('should return 404 if track is not found', async () => {
      mockingoose(Track)
        .toReturn(null, 'findOne');
      await queueController.addToQueue(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should append track to queue', async () => {
      const oldLength = queue.tracks.length;
      await queueController.addToQueue(req, res, next);
      expect(queue.tracks.length).toBe(oldLength + 1);
      expect(queue.tracks[oldLength]).toBe(track._id);
    });

    it('should return 204 if valid', async () => {
      await queueController.addToQueue(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(204);
    });
  });
});