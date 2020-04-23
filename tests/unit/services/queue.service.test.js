const queueService = require('../../../src/services/queue.service');
const userService = require('../../../src/services/user.service');
const playerService = require('../../../src/services/player.service');
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
  let queues;
  beforeEach(() => {
    queues = [0, 1];
    jest.clearAllMocks();
    player = playerMocks.createFakePlayer();
    user = userMocks.createFakeUser();
    queue = queueMocks.createFakeQueue();
    queue.tracks = [user._id, queue._id, player._id];
    mockingoose(Queue).toReturn(queue, 'findOne');
    mockingoose(Artist).toReturn([], 'aggregate');
    mockingoose(Album).toReturn([], 'aggregate');
    mockingoose(Playlist).toReturn([], 'aggregate');
  });

  describe('Go Next Normal', () => {
    beforeEach(() => {
      queue.currentIndex = 0;
      queue.tracks = [user._id, player._id, queue._id];
    });

    it('should go to the next track', async () => {
      const result = await queueService.goNextNormal(queue, player, queues);
      expect(result.currentIndex).toBe(1);
    });

    it('should go to the first track if it is playing the last track and the repeat is context', async () => {
      queue.currentIndex = queue.tracks.length - 1;
      player.repeatState = 'context';
      const result = await queueService.goNextNormal(queue, player, queues);
      expect(result.currentIndex).toBe(0);
    });
  });

  describe('Go Previous Normal', () => {
    beforeEach(() => {
      queue.currentIndex = 2;
      queue.tracks = [user._id, player._id, queue._id];
    });

    it('should go to the previous track', async () => {
      const result = await queueService.goPreviousNormal(queue, player, queues);
      expect(result.currentIndex).toBe(1);
    });

    it('should go to the last track if it is playing the first track and the repeat is context', async () => {
      queue.currentIndex = 0;
      player.repeatState = 'context';
      const result = await queueService.goPreviousNormal(queue, player, queues);
      expect(result.currentIndex).toBe(2);
    });
  });

  describe('Create similar queue', () => {
    beforeEach(() => {
      mockingoose(Playlist).toReturn(null, 'aggregate');
      mockingoose(Album).toReturn(null, 'aggregate');
      mockingoose(Artist).toReturn(null, 'aggregate');
      mockingoose(Playlist).toReturn(null, 'findOne');
      mockingoose(Album).toReturn(null, 'findOne');
      mockingoose(Artist).toReturn(null, 'findOne');
    });

    it('should call createQueueFromRelatedArtists and return null if context is artist', async () => {
      queue.context.type = 'artist';
      const result = await queueService.createSimilarQueue(queue);
      expect(result).toBe(null);
    });

    it('should call createQueueFromRelatedAlbums and return null if context is album', async () => {
      queue.context.type = 'album';
      const result = await queueService.createSimilarQueue(queue);
      expect(result).toBe(null);
    });

    it('should call createQueueFromRelatedPlaylists and return null if context is playlist', async () => {
      queue.context.type = 'playlist';
      const result = await queueService.createSimilarQueue(queue);
      expect(result).toBe(null);
    });

    it('should call createQueueFromListOfTracks and return null if context is unknown', async () => {
      queue.context.type = 'unknown';
      const result = await queueService.createSimilarQueue(queue);
      expect(result).toBe(null);
    });
  });

  describe('Fill Queue from Track Uris', () => {
    let uris;
    beforeEach(() => {
      uris = ['oud:track:1'];
      mockingoose(Track).toReturn(null, 'findOne');
    });

    it('should return queue', async () => {
      const result = await queueService.fillQueueFromTracksUris(uris, queues, player);
      expect(result).toBe(queue);
    });

    it('should call set Player to default if queues is empty', async () => {
      playerService.setPlayerToDefault = jest.fn();
      const result = await queueService.fillQueueFromTracksUris(uris, [], player);
      expect(playerService.setPlayerToDefault).toBeCalled();
      expect(playerService.setPlayerToDefault).toBeCalledWith(player);
    });
  });

  describe('Set queue to default', () => {
    it('should set queue to default', () => {
      queueService.setQueueToDefault(queue);
      expect(queue.currentIndex).toBe(0);
      expect(queue.shuffleIndex).toBeUndefined();
      expect(queue.shuffleList).toBeUndefined();
    });
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

  describe('Shuffle Queue', () => {
    beforeEach(() => {
      queue.shuffleList = null;
      queue.currentIndex = 0;
      queue.tracks = [user._id, player._id, queue._id];
    });

    it('should shuffle the queue', () => {
      const result = queueService.shuffleQueue(queue);
      expect(result.shuffleList.length).toBe(queue.tracks.length);
    });

    it('should set shuffleIndex', () => {
      const result = queueService.shuffleQueue(queue);
      expect(result.shuffleIndex).toBe(result.shuffleList.indexOf(queue.currentIndex));
    });
  });

  describe('Go Next Shuffle', () => {
    beforeEach(() => {
      queue.shuffleList = [0, 2, 1];
      queue.currentIndex = 0;
      queue.tracks = [user._id, player._id, queue._id];
      queue.shuffleIndex = 0;
    });

    it('should go to the next track', async () => {
      const result = await queueService.goNextShuffle(queue, player, queues);
      expect(result.shuffleIndex).toBe(1);
      expect(result.currentIndex).toBe(2);
    });

    it('should go to the first track if it is playing the last track and the repeat is context', async () => {
      queue.shuffleIndex = queue.tracks.length - 1;
      player.repeatState = 'context';
      const result = await queueService.goNextShuffle(queue, player, queues);
      expect(result.shuffleIndex).toBe(0);
      expect(result.currentIndex).toBe(0);
    });
  });

  describe('Go Previous Shuffle', () => {
    beforeEach(() => {
      queue.shuffleList = [0, 2, 1];
      queue.currentIndex = 1;
      queue.tracks = [user._id, player._id, queue._id];
      queue.shuffleIndex = 2;
    });

    it('should go to the previous track', async () => {
      const result = await queueService.goPreviousShuffle(queue, player, queues);
      expect(result.shuffleIndex).toBe(1);
      expect(result.currentIndex).toBe(2);
    });

    it('should go to the last track if it is playing the first track and the repeat is context', async () => {
      queue.shuffleIndex = 0;
      player.repeatState = 'context';
      const result = await queueService.goPreviousShuffle(queue, player, queues);
      expect(result.shuffleIndex).toBe(2);
      expect(result.currentIndex).toBe(1);
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

  describe('Create Queue from related artists', () => {
    beforeEach(() => {
      mockingoose(Artist).toReturn([{ _id: 1 }, { _id: 2 }, { _id: 3 }, { _id: 4 }], 'aggregate');
      mockingoose(Artist).toReturn({}, "findOne");
      mockingoose(Track).toReturn([{ _id: 1 }, { _id: 2 }, { _id: 3 }, { _id: 4 }], 'aggregate');
      mockingoose(Track).toReturn([{ _id: 1 }, { _id: 2 }, { _id: 3 }, { _id: 4 }]);
    });

    it('should return null if artist is not found', async () => {
      mockingoose(Artist).toReturn(null, "findOne");
      const result = await queueService.createQueueFromRelatedArtists('1');
      expect(result).toBe(null);
    });

    it('should return null if artists is not found', async () => {
      mockingoose(Artist).toReturn(null, 'aggregate');
      const result = await queueService.createQueueFromRelatedArtists('1');
      expect(result).toBe(null);
    });

    it('should return null if artists is empty', async () => {
      mockingoose(Artist).toReturn([], 'aggregate');
      const result = await queueService.createQueueFromRelatedArtists('1');
      expect(result).toBe(null);
    });

    it('should return null if tracks is null', async () => {
      mockingoose(Track).toReturn(null, 'find');
      const result = await queueService.createQueueFromRelatedArtists('1');
      expect(result).toBe(null);
    });

    it('should return null if tracks is empty', async () => {
      mockingoose(Track).toReturn([], 'find');
      const result = await queueService.createQueueFromRelatedArtists('1');
      expect(result).toBe(null);
    });

    it('should create Queue', async () => {
      Queue.create = jest.fn().mockResolvedValue(queue);
      const result = await queueService.createQueueFromRelatedArtists('1');
      expect(Queue.create).toBeCalled();
    });
  });

  describe('Create Queue from related albums', () => {
    beforeEach(() => {
      mockingoose(Album).toReturn([
        { _id: 1, tracks: [1] },
        { _id: 2, tracks: [2] },
        { _id: 3, tracks: [3] },
        { _id: 4, tracks: [4] }], 'aggregate');
      mockingoose(Album).toReturn({}, "findOne");
    });

    it('should return null if Album is not found', async () => {
      mockingoose(Album).toReturn(null, "findOne");
      const result = await queueService.createQueueFromRelatedAlbums('1');
      expect(result).toBe(null);
    });

    it('should return null if Albums is not found', async () => {
      mockingoose(Album).toReturn(null, 'aggregate');
      const result = await queueService.createQueueFromRelatedAlbums('1');
      expect(result).toBe(null);
    });

    it('should return null if Albums is empty', async () => {
      mockingoose(Album).toReturn([], 'aggregate');
      const result = await queueService.createQueueFromRelatedAlbums('1');
      expect(result).toBe(null);
    });

    it('should return null if tracks is null', async () => {
      mockingoose(Album).toReturn([{ _id: 4 }], 'aggregate');
      const result = await queueService.createQueueFromRelatedAlbums('1');
      expect(result).toBe(null);
    });

    it('should return null if tracks is empty', async () => {
      mockingoose(Album).toReturn([{ _id: 4, tracks: [] }], 'aggregate');
      const result = await queueService.createQueueFromRelatedAlbums('1');
      expect(result).toBe(null);
    });

    it('should create Queue', async () => {
      Queue.create = jest.fn().mockResolvedValue(queue);
      const result = await queueService.createQueueFromRelatedAlbums('1');
      expect(Queue.create).toBeCalled();
    });
  });

  describe('Create Queue from related Playlists', () => {
    beforeEach(() => {
      mockingoose(Playlist).toReturn([
        { _id: 1, tracks: [1] },
        { _id: 2, tracks: [2] },
        { _id: 3, tracks: [3] },
        { _id: 4, tracks: [4] }], 'aggregate');
      mockingoose(Playlist).toReturn({}, "findOne");
    });

    it('should return null if Playlist is not found', async () => {
      mockingoose(Playlist).toReturn(null, "findOne");
      const result = await queueService.createQueueFromRelatedPlaylists('1');
      expect(result).toBe(null);
    });

    it('should return null if Playlists is not found', async () => {
      mockingoose(Playlist).toReturn(null, 'aggregate');
      const result = await queueService.createQueueFromRelatedPlaylists('1');
      expect(result).toBe(null);
    });

    it('should return null if Playlists is empty', async () => {
      mockingoose(Playlist).toReturn([], 'aggregate');
      const result = await queueService.createQueueFromRelatedPlaylists('1');
      expect(result).toBe(null);
    });

    it('should return null if tracks is null', async () => {
      mockingoose(Playlist).toReturn([{ _id: 4 }], 'aggregate');
      const result = await queueService.createQueueFromRelatedPlaylists('1');
      expect(result).toBe(null);
    });

    it('should return null if tracks is empty', async () => {
      mockingoose(Playlist).toReturn([{ _id: 4, tracks: [] }], 'aggregate');
      const result = await queueService.createQueueFromRelatedPlaylists('1');
      expect(result).toBe(null);
    });

    it('should create Queue', async () => {
      Queue.create = jest.fn().mockResolvedValue(queue);
      const result = await queueService.createQueueFromRelatedPlaylists('1');
      expect(Queue.create).toBeCalled();
    });
  });

  describe('Create Queue from List of tracks', () => {
    beforeEach(() => {
      mockingoose(Playlist).toReturn([
        { _id: 1, tracks: [1] },
        { _id: 2, tracks: [2] },
        { _id: 3, tracks: [3] },
        { _id: 4, tracks: [4] }], 'aggregate');
      mockingoose(Playlist).toReturn({}, "findOne");
    });

    it('should return null if Playlists is not found', async () => {
      mockingoose(Playlist).toReturn(null, 'aggregate');
      const result = await queueService.createQueueFromListOfTracks('1');
      expect(result).toBe(null);
    });

    it('should return null if Playlists is empty', async () => {
      mockingoose(Playlist).toReturn([], 'aggregate');
      const result = await queueService.createQueueFromListOfTracks('1');
      expect(result).toBe(null);
    });

    it('should return null if tracks is null', async () => {
      mockingoose(Playlist).toReturn([{ _id: 4 }], 'aggregate');
      const result = await queueService.createQueueFromListOfTracks('1');
      expect(result).toBe(null);
    });

    it('should return null if tracks is empty', async () => {
      mockingoose(Playlist).toReturn([{ _id: 4, tracks: [] }], 'aggregate');
      const result = await queueService.createQueueFromListOfTracks('1');
      expect(result).toBe(null);
    });

    it('should create Queue', async () => {
      Queue.create = jest.fn().mockResolvedValue(queue);
      const result = await queueService.createQueueFromListOfTracks('1');
      expect(Queue.create).toBeCalled();
    });
  });
});