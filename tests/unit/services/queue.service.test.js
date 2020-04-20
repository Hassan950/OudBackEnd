const queueService = require('../../../src/services/queue.service');
const { Player, Device, Track, Queue } = require('../../../src/models');
const mockingoose = require('mockingoose').default;
const playerMocks = require('../../utils/models/player.model.mocks');
const queueMocks = require('../../utils/models/queue.model.mocks');
const deviceMocks = require('../../utils/models/device.model.mocks');
const userMocks = require('../../utils/models/user.model.mocks');

describe('Queue Service', () => {
  let queue;
  let user;
  let player;
  beforeEach(() => {
    player = playerMocks.createFakePlayer();
    user = userMocks.createFakeUser();
    queue = queueMocks.createFakeQueue();
    queue.tracks = [user._id, queue._id, player._id];
    mockingoose(Queue).toReturn(queue, 'findOne');
  });

  describe('GetQueueById', () => {
    it('should get queue', async () => {
      const result = await queueService.getQueueById(queue._id);
      expect(result).toBe(queue);
    });

    it('should select queue details if ops.selectDetails is true', async () => {
      queue.select = jest.fn().mockResolvedValue(queue);
      Queue.findById = jest.fn().mockReturnValue(queue);
      await queueService.getQueueById(queue._id, { selectDetails: true });
      expect(queue.select).toBeCalled();
      expect(queue.select.mock.calls[0][0]).toBe('+currentIndex +shuffleList +shuffleIndex');
      Queue.findById.mockRestore();
    });

    it('should select shuffleList if sort is true and selectDetails is false', async () => {
      queue.select = jest.fn().mockResolvedValue(queue);
      Queue.findById = jest.fn().mockReturnValue(queue);
      await queueService.getQueueById(queue._id, { selectDetails: false, sort: true });
      expect(queue.select).toBeCalled();
      expect(queue.select.mock.calls[0][0]).toBe('+shuffleList');
      Queue.findById.mockRestore();
    });

    it('should set shuffleList to undefined is sort true', async () => {
      queue.shuffleList = [];
      queue.select = jest.fn().mockResolvedValue(queue);
      Queue.findById = jest.fn().mockReturnValue(queue);
      await queueService.getQueueById(queue._id, { sort: true });
      expect(queue.shuffleList).toBeUndefined();
      Queue.findById.mockRestore();
    });

    it('should reorder queue tracks', async () => {
      queue.shuffleList = [0, 2, 1];
      queue.select = jest.fn().mockResolvedValue(queue);
      Queue.findById = jest.fn().mockReturnValue(queue);
      const result = await queueService.getQueueById(queue._id, { sort: true });
      expect(result.tracks[0]).toBe(user._id);
      expect(result.tracks[1]).toBe(player._id);
      expect(result.tracks[2]).toBe(queue._id);
      Queue.findById.mockRestore();
    });
  });
});