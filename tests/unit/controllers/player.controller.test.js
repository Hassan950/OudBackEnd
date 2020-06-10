const playerMocks = require('../../utils/models/player.model.mocks');
const queueMocks = require('../../utils/models/queue.model.mocks');
const deviceMocks = require('../../utils/models/device.model.mocks');
const userMocks = require('../../utils/models/user.model.mocks');
const requestMocks = require('../../utils/request.mock.js');
const { Player, Device, User, Queue, Album, Artist, Playlist, Track } = require('../../../src/models');
const { playerController } = require('../../../src/controllers');
const playerService = require('../../../src/services/player.service');
const mockingoose = require('mockingoose').default;

describe('Player controller', () => {
  let player;
  let user;
  let req;
  let res;
  let next;
  beforeEach(() => {
    player = playerMocks.createFakePlayer();
    player.item.audioUrl = 'default.mp3';
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
    beforeEach(() => {
      player.item.audioUrl = 'default.mp3';
    });
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
    it('should return 403 if currently playing type is ad', async () => {
      player.currentlyPlayingType = 'ad';
      await playerController.pausePlayer(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
  });

  describe('Resume player', () => {
    let device;
    let dummyId;
    let queue;
    beforeEach(() => {
      queue = queueMocks.createFakeQueue();
      player.save = jest.fn().mockResolvedValue(player);
      device = deviceMocks.createFakeDevice();
      mockingoose(Queue).toReturn(queue, 'findOne');
      mockingoose(Device).toReturn(device, 'findOne');
      user.queues = [queue._id];
      User.findById = jest.fn().mockImplementationOnce(() => (
        { select: jest.fn().mockResolvedValueOnce(user) }
      ));
      req.query.deviceId = device._id;
      req.query.queueIndex = 0;
      dummyId = req.user._id;
      req.body.uris = [`oud:track:${dummyId}`];
      req.body.offset = {};
      req.body.positionMs = 1;
      req.body.contextUri = `oud:playlist:${dummyId}`;
      mockingoose(Album).toReturn({ tracks: [dummyId] }, 'findOne');
      mockingoose(Playlist).toReturn({ tracks: [dummyId] }, 'findOne');
      mockingoose(Artist).toReturn({ popularSongs: [dummyId] }, 'findOne');
      player.item = dummyId;
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
        .toReturn(track, 'findOne')
        .toReturn([track], 'find');
      playerService.addTrackToPlayer = jest.fn().mockImplementationOnce(() => { player.item = track._id });
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
      queue.tracks = [track._id];
      await playerController.resumePlayer(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(204);
    });

    it('should save the player', async () => {
      queue.tracks = [track._id];
      await playerController.resumePlayer(req, res, next);
      expect(player.save.mock.calls.length).toBe(1);
    });

    it('should call add track to player to true', async () => {
      await playerController.resumePlayer(req, res, next);
      expect(playerService.addTrackToPlayer).toBeCalled();
    });

    it('should change player positionMs if passed', async () => {
      player.positionMs = 0;
      await playerController.resumePlayer(req, res, next);
      expect(player.positionMs).toBe(req.body.positionMs);
    });

    it('should return 403 if currently playing type is ad', async () => {
      player.currentlyPlayingType = 'ad';
      await playerController.resumePlayer(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(403);
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
      player.progressMs = 0;
      await playerController.seekPlayer(req, res, next);
      expect(player.progressMs).toBe(req.query.positionMs);
    });
    it('should return 403 if currently playing type is ad', async () => {
      player.currentlyPlayingType = 'ad';
      await playerController.seekPlayer(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
  });
});