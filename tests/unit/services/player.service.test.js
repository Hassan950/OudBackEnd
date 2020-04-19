const playerService = require('../../../src/services/player.service');
const { Player, Device, Track } = require('../../../src/models');
const mockingoose = require('mockingoose').default;
const playerMocks = require('../../utils/models/player.model.mocks');
const queueMocks = require('../../utils/models/queue.model.mocks');
const deviceMocks = require('../../utils/models/device.model.mocks');
const userMocks = require('../../utils/models/user.model.mocks');

describe('Player Service', () => {
  let player;
  let user;
  beforeEach(() => {
    player = playerMocks.createFakePlayer();
    player.item.audioUrl = 'track/audio';
    user = userMocks.createFakeUser();
    mockingoose(Player)
      .toReturn(player, 'findOne');
  });

  describe('Get Player', () => {
    it('should return player if populate is false', async () => {
      const result = await playerService.getPlayer(user._id, { populate: false });
      expect(result).toBe(player);
    });

    it('should return null if player is not found and populate is false', async () => {
      mockingoose(Player)
        .toReturn(null, 'findOne');
      const result = await playerService.getPlayer(user._id, { populate: false });
      expect(result).toBe(null);
    });

    it('should return populated player if populate is true', async () => {
      const result = await playerService.getPlayer(user._id, { populate: true });
      expect(result).toBe(player);
    });

    it('should return populated player with audioUrl if populate is true and link is passed', async () => {
      const result = await playerService.getPlayer(user._id, { populate: true, link: 'host/' });
      let audio = player.item.audioUrl.split('/');
      let audioUrl = 'host/' + audio[audio.length - 1];
      expect(result).toBe(player);
      expect(result.item.audioUrl).toBe(audioUrl);
    });

    it('should return populated player with audioUrl undefined if populate is true and link is not passed', async () => {
      const result = await playerService.getPlayer(user._id, { populate: true });
      player.item.audioUrl = undefined;
      expect(result).toBe(player);
    });
  });

  describe('Get currently playing', () => {
    it('should return null if currentlyPlaying.item is null', async () => {
      player.item = null;
      mockingoose(Player)
        .toReturn(player, 'findOne');
      const result = await playerService.getCurrentlyPlaying(user._id);
      expect(result).toBe(null);
    });

    it('should return null if player is not found', async () => {
      mockingoose(Player)
        .toReturn(null, 'findOne');
      const result = await playerService.getCurrentlyPlaying(user._id);
      expect(result).toBe(null);
    });

    it('should return null if currentlyPlaying with audioUrl if link is passed', async () => {
      const result = await playerService.getCurrentlyPlaying(user._id, { link: 'host/' });
      let audio = player.item.audioUrl.split('/');
      let audioUrl = 'host/' + audio[audio.length - 1];
      expect(result).toBe(player);
      expect(result.item.audioUrl).toBe(audioUrl);
    });

    it('should return currentlyPlaying with audioUrl undefined link is not passed', async () => {
      const result = await playerService.getCurrentlyPlaying(user._id, { populate: true });
      player.item.audioUrl = undefined;
      expect(result).toBe(player);
    });
  });

  describe('Add track to player', () => {
    const { Track } = require('../../../src/models');
    beforeEach(() => {
      Track.findByIdAndUpdate = jest.fn().mockImplementation(() => { return { exec: jest.fn() }; });
    });
    it('should increase track views', () => {
      playerService.addTrackToPlayer(player, user._id);
      expect(Track.findByIdAndUpdate.mock.calls.length).toBe(1);
    });

    it('should play the track', () => {
      playerService.addTrackToPlayer(player, user._id);
      expect(player.item).toBe(user._id);
      expect(player.progressMs).toBe(0);
      expect(player.isPlaying).toBe(true);
      expect(player.currentlyPlayingType).toBe('track');
    });

    it('should set context if passed', () => {
      const context = { type: 'artist', id: user._id };
      playerService.addTrackToPlayer(player, user._id, context);
      expect(player.context).toEqual(context);
    });
  });

  describe('Set Player to default', () => {
    it('should set player to default', () => {
      playerService.setPlayerToDefault(player);
      expect(player.item).toBe(null);
      expect(player.context).toEqual({ type: 'unknown' });
      expect(player.progressMs).toBe(null);
      expect(player.shuffleState).toBe(false);
      expect(player.repeatState).toBe('off');
      expect(player.isPlaying).toBe(false);
      expect(player.currentlyPlayingType).toBe('unknown');
    });
  });

  describe('Add Device to player', () => {
    let device;
    beforeEach(() => {
      device = deviceMocks.createFakeDevice();
      mockingoose(Device)
        .toReturn(device, 'findOne');
    });

    it('should return null if device is not found ', async () => {
      mockingoose(Device)
        .toReturn(null, 'findOne');
      const result = await playerService.addDeviceToPlayer(player, device._id);
      expect(result).toBe(null);
    });

    it('should set player device and return player', async () => {
      const result = await playerService.addDeviceToPlayer(player, device._id);
      expect(result).toBe(player);
      expect(result.device).toBe(device._id);
    });
  });

  describe('Create Player', () => {
    beforeEach(() => {
      mockingoose(Player).toReturn(player, 'save');
    });

    it('should create player and return it', async () => {
      const result = await playerService.createPlayer(user._id);
      expect(result).toBe(player);
    });
  });

  describe('Change PLayer Progress', () => {
    let track;
    let queue;
    const queueService = require('../../../src/services/queue.service');
    beforeEach(() => {
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
      queue = queueMocks.createFakeQueue();
      mockingoose(Track).toReturn(track, 'findOne');
      queueService.getQueueById = jest.fn().mockResolvedValue(queue);
      queueService.goNext = jest.fn();
    });

    it('should set player progressMs and return player', async () => {
      const result = await playerService.changePlayerProgress(player, 200, []);
      expect(result).toBe(player);
      expect(result.progressMs).toBe(200);
    });

    it('should set player progress to 0 if progressMs >= track duration and repeatState is track and track is passed', async () => {
      player.repeatState = 'track';
      const result = await playerService.changePlayerProgress(player, track.duration + 200, [], track);
      expect(result).toBe(player);
      expect(result.progressMs).toBe(0);
    });

    it('should set player progress to 0 if progressMs >= track duration and repeatState is track and track is not passed', async () => {
      player.repeatState = 'track';
      const result = await playerService.changePlayerProgress(player, track.duration + 200, []);
      expect(result).toBe(player);
      expect(result.progressMs).toBe(0);
    });

    it('should call getQueueById if progressMs >= track duration and repeatState is not track', async () => {
      player.repeatState = 'context';
      await playerService.changePlayerProgress(player, track.duration + 200, [1], track);
      expect(queueService.getQueueById.mock.calls.length).toBe(1);
      expect(queueService.getQueueById.mock.calls[0][0]).toBe(1);
      expect(queueService.getQueueById.mock.calls[0][1]).toEqual({ selectDetails: true });
    });

    it('should return null if queue is not found', async () => {
      player.repeatState = 'context';
      queueService.getQueueById = jest.fn().mockResolvedValue(null);
      const result = await playerService.changePlayerProgress(player, track.duration + 200, [1], track);
      expect(result).toBe(null);
    });
    it('should return null if queue.tracks is not found', async () => {
      player.repeatState = 'context';
      queue.tracks = null;
      queueService.getQueueById = jest.fn().mockResolvedValue(queue);
      const result = await playerService.changePlayerProgress(player, track.duration + 200, [1], track);
      expect(result).toBe(null);
    });
    it('should return null if queue.tracks is empty', async () => {
      player.repeatState = 'context';
      queue.tracks = [];
      queueService.getQueueById = jest.fn().mockResolvedValue(queue);
      const result = await playerService.changePlayerProgress(player, track.duration + 200, [1], track);
      expect(result).toBe(null);
    });
    it('should call goNext', async () => {
      player.repeatState = 'context';
      const queues = [1];
      await playerService.changePlayerProgress(player, track.duration + 200, queues, track);
      expect(queueService.goNext.mock.calls.length).toBe(1);
      expect(queueService.goNext.mock.calls[0][0]).toBe(queue);
      expect(queueService.goNext.mock.calls[0][1]).toBe(player);
      expect(queueService.goNext.mock.calls[0][2]).toEqual(queues);
    });

    it('should save the queue', async () => {
      queue.save = jest.fn();
      player.repeatState = 'context';
      const queues = [1];
      await playerService.changePlayerProgress(player, track.duration + 200, queues, track);
      expect(queue.save).toBeCalled();
    });
  });
});