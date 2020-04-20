const queueService = require('../../../src/services/queue.service');
const { Player, Device, Track, Artist, Playlist, Queue, Album } = require('../../../src/models');
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
    jest.clearAllMocks();
    player = playerMocks.createFakePlayer();
    user = userMocks.createFakeUser();
    queue = queueMocks.createFakeQueue();
    queue.tracks = [user._id, queue._id, player._id];
    mockingoose(Queue).toReturn(queue, 'findOne');
  });

  describe('Get Track Poition', () => {
    it('should return -1 if queue in not found', async () => {
      mockingoose(Queue).toReturn(null, 'findOne');
      const result = await queueService.getTrackPosition(queue._id, user._id);
      expect(result).toBe(-1);
    });

    it('should return -1 if queue.tracks in not found', async () => {
      queue.tracks = null;
      mockingoose(Queue).toReturn(queue, 'findOne');
      const result = await queueService.getTrackPosition(queue._id, user._id);
      expect(result).toBe(-1);
    });

    it('should return -1 if track is not found', async () => {
      queue.tracks = [1, 2];
      mockingoose(Queue).toReturn(queue, 'findOne');
      const result = await queueService.getTrackPosition(queue._id, 5);
      expect(result).toBe(-1);
    });

    it('should return track position if track is found', async () => {
      queue.tracks = [user._id, player._id];
      mockingoose(Queue).toReturn(queue, 'findOne');
      const result = await queueService.getTrackPosition(queue._id, user._id);
      expect(result).toBe(0);
    });
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

  describe('Create Queue With Context', () => {
    let context;

    beforeEach(() => {
      Queue.create = jest.fn().mockResolvedValue(queue);
    });

    afterEach(() => {
      Queue.create.mockRestore();
    });

    describe('Album', () => {
      beforeEach(() => {
        context = 'oud:album:1';
      });
      it('should return null if album is null', async () => {
        mockingoose(Album).toReturn(null, 'findOne');
        const result = await queueService.createQueueWithContext(context);
        expect(result).toBe(null);
      });
      it('should return null if album.tracks is null', async () => {
        mockingoose(Album).toReturn({}, 'findOne');
        const result = await queueService.createQueueWithContext(context);
        expect(result).toBe(null);
      });
      it('should return null if album.tracks is empty', async () => {
        mockingoose(Album).toReturn({ tracks: [] }, 'findOne');
        const result = await queueService.createQueueWithContext(context);
        expect(result).toBe(null);
      });
      it('should create queue with album tracks', async () => {
        const tracks = [user._id, queue._id, player._id];
        mockingoose(Album).toReturn({ tracks: tracks }, 'findOne');
        await queueService.createQueueWithContext(context);
        expect(Queue.create).toBeCalled();
        expect(Queue.create.mock.calls[0][0].tracks[0]).toBe(tracks[0]);
        expect(Queue.create.mock.calls[0][0].tracks[1]).toBe(tracks[1]);
        expect(Queue.create.mock.calls[0][0].tracks[2]).toBe(tracks[2]);
        expect(Queue.create.mock.calls[0][0].context.type).toBe('album');
        expect(Queue.create.mock.calls[0][0].context.id).toBe('1');
      });
    });
    describe('Playlist', () => {
      beforeEach(() => {
        context = 'oud:playlist:1';
      });
      it('should return null if playlist is null', async () => {
        mockingoose(Playlist).toReturn(null, 'findOne');
        const result = await queueService.createQueueWithContext(context);
        expect(result).toBe(null);
      });
      it('should return null if playlist.tracks is null', async () => {
        mockingoose(Playlist).toReturn({}, 'findOne');
        const result = await queueService.createQueueWithContext(context);
        expect(result).toBe(null);
      });
      it('should return null if playlist.tracks is empty', async () => {
        mockingoose(Playlist).toReturn({ tracks: [] }, 'findOne');
        const result = await queueService.createQueueWithContext(context);
        expect(result).toBe(null);
      });
      it('should create queue with playlist tracks', async () => {
        const tracks = [user._id, queue._id, player._id];
        mockingoose(Playlist).toReturn({ tracks: tracks }, 'findOne');
        await queueService.createQueueWithContext(context);
        expect(Queue.create).toBeCalled();
        expect(Queue.create.mock.calls[0][0].tracks[0]).toBe(tracks[0]);
        expect(Queue.create.mock.calls[0][0].tracks[1]).toBe(tracks[1]);
        expect(Queue.create.mock.calls[0][0].tracks[2]).toBe(tracks[2]);
        expect(Queue.create.mock.calls[0][0].context.type).toBe('playlist');
        expect(Queue.create.mock.calls[0][0].context.id).toBe('1');
      });
    });
    describe('Artist', () => {
      let tracks;
      beforeEach(() => {
        context = 'oud:artist:1';
        tracks = [user, queue, player];
        mockingoose(Track).toReturn(tracks);
      });
      it('should return null if artist is null', async () => {
        mockingoose(Artist).toReturn(null, 'findOne');
        const result = await queueService.createQueueWithContext(context);
        expect(result).toBe(null);
      });
      it('should create queue with artist tracks', async () => {
        mockingoose(Artist).toReturn({ tracks: tracks }, 'findOne');
        await queueService.createQueueWithContext(context);
        expect(Queue.create).toBeCalled();
        expect(Queue.create.mock.calls[0][0].tracks).toBeDefined();
        expect(Queue.create.mock.calls[0][0].context.type).toBe('artist');
        expect(Queue.create.mock.calls[0][0].context.id).toBe('1');
      });
    });
  });

  describe('Delete queue By Id', () => {
    it('should delete queue', async () => {
      Queue.deleteOne = jest.fn().mockResolvedValue(null);
      await queueService.deleteQueueById(queue._id);
      expect(Queue.deleteOne).toBeCalled();
      Queue.deleteOne.mockRestore();
    });
  });

  describe('Append to Queue', () => {
    let tracks;
    beforeEach(() => {
      tracks = [user._id, queue._id, player._id];
    });

    it('should select shuffleList', async () => {
      queue.select = jest.fn().mockResolvedValue(queue);
      Queue.findById = jest.fn().mockReturnValue(queue);
      await queueService.appendToQueue(queue._id, tracks);
      expect(queue.select).toBeCalled();
      expect(queue.select).toBeCalledWith('+shuffleList');
      Queue.findById.mockRestore();
    });

    it('should return null if queue is not found', async () => {
      queue.select = jest.fn().mockResolvedValue(null);
      Queue.findById = jest.fn().mockReturnValue(queue);
      const result = await queueService.appendToQueue(queue._id, tracks);
      expect(result).toBe(null);
      Queue.findById.mockRestore();
    });

    it('should take unique only', async () => {
      queue.tracks = [user._id, queue._id];
      queue.select = jest.fn().mockResolvedValue(queue);
      Queue.findById = jest.fn().mockReturnValue(queue);
      await queueService.appendToQueue(queue._id, tracks);
      expect(queue.tracks.length).toBe(3);
      Queue.findById.mockRestore();
    });

    it('should assign tracks to empty array is tracks is not found', async () => {
      queue.tracks = undefined;
      queue.select = jest.fn().mockResolvedValue(queue);
      Queue.findById = jest.fn().mockReturnValue(queue);
      const result = await queueService.appendToQueue(queue._id, []);
      expect(queue.tracks).toBeDefined();
      Queue.findById.mockRestore();
    });

    it('should save queue', async () => {
      queue.tracks = [user._id, queue._id];
      queue.select = jest.fn().mockResolvedValue(queue);
      queue.save = jest.fn().mockResolvedValue(queue);
      Queue.findById = jest.fn().mockReturnValue(queue);
      await queueService.appendToQueue(queue._id, tracks);
      expect(queue.save).toBeCalled();
      Queue.findById.mockRestore();
    });
  });

  describe('Create queue from tracks', () => {
    let tracks;
    beforeEach(() => {
      tracks = [user._id, queue._id, player._id];
      Queue.create = jest.fn().mockResolvedValue(queue);
    });

    it('should return queue', async () => {
      const result = await queueService.createQueueFromTracks(tracks);
      expect(result).toBe(queue);
      Queue.create.mockRestore();
    });

    it('should create queue', async () => {
      const result = await queueService.createQueueFromTracks(tracks);
      expect(Queue.create).toBeCalled();
      expect(Queue.create).toBeCalledWith({ tracks: tracks });
      Queue.create.mockRestore();
    });
  });
});