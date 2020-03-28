const { followingController } = require('../../../src/controllers/');
const {
  Followings,
  PlaylistFollowings,
  User,
  Artist
} = require('../../../src/models');
const AppError = require('../../../src/utils/AppError');
const httpStatus = require('http-status');
const requestMocks = require('../../utils/request.mock');
const mongoose = require('mongoose');
const mockingoose = require('mockingoose').default;

describe('Following controller', () => {
  let req;
  let res;
  let next;
  let following;
  let user;
  let artist;
  beforeEach(() => {
    req = { params: {}, query: {}, body: {} };
    res = requestMocks.mockResponse();
    next = jest.fn();
  });
  describe('checkFollowings', () => {
    beforeEach(() => {
      following = new Followings({
        userId: '5e6ba8747d3eda317003c976',
        followedId: '5e6ba6917fb1cf2ad80b4fb2',
        type: 'User'
      });
      req.user = following.userId;
      next = jest.fn();
    });
    it('Should return list of boolean that indicates the following for each user/artist with status code 200', async () => {
      mockingoose(Followings).toReturn([following], 'find');
      // two valid ID's
      req.query.ids = ['5e6ba6917fb1cf2ad80b4fb2', '5e6ba8747d3eda317003c976'];
      await followingController.checkFollowings(req, res, next);
      expect(res.send.mock.calls[0][0]).toEqual(
        expect.arrayContaining([true, false])
      );
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });

    it('Should return an array contains falses when no following found', async () => {
      mockingoose(Followings).toReturn([], 'find');
      // two valid ID's
      req.query.ids = ['5e6ba6917fb1cf2ad80b4fb2', '5e6ba8747d3eda317003c976'];
      await followingController.checkFollowings(req, res, next);
      expect(res.send.mock.calls[0][0]).toEqual([false, false]);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });
  });
  describe('checkFollowingsPlaylist', () => {
    beforeEach(() => {
      PlaylistFollowings.schema.path('playlistId', Object);
      following = new PlaylistFollowings({
        userId: '5e6ba8747d3eda317003c976',
        playlistId: {
          _id: '5e6ba6917fb1cf2ad80b4fb2',
          public: true
        }
      });
    });
    it('Should return list of boolean that indicates whether the user follows this playlist or not with status code 200', async () => {
      mockingoose(PlaylistFollowings).toReturn([following], 'find');
      // valid ID
      req.query.ids = ['5e6ba8747d3eda317003c976'];
      req.params.playlistId = '5e6ba6917fb1cf2ad80b4fb2';
      await followingController.checkFollowingsPlaylist(req, res, next);
      expect(res.send.mock.calls[0][0]).toEqual([true]);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });

    it('Should return an array contains falses when no following found', async () => {
      mockingoose(PlaylistFollowings).toReturn([], 'find');
      // two valid ID's
      req.query.ids = ['5e6ba6917fb1cf2ad80b4fb2', '5e6ba8747d3eda317003c976'];
      await followingController.checkFollowingsPlaylist(req, res, next);
      expect(res.send.mock.calls[0][0]).toEqual([false, false]);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });

    it('Should return false when checking a private playlist', async () => {
      following.playlistId.public = false;
      mockingoose(PlaylistFollowings).toReturn([following], 'find');
      // two valid ID's
      req.query.ids = ['5e6ba8747d3eda317003c976'];
      await followingController.checkFollowingsPlaylist(req, res, next);
      expect(res.send.mock.calls[0][0]).toEqual([false]);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });

    it('If the current user logged in and owns this playlist he is able to see the following even if the playlist is private', async () => {
      following.playlistId.public = false;
      req.user = { _id: '5e6ba8747d3eda317003c976' };
      mockingoose(PlaylistFollowings).toReturn([following], 'find');
      // two valid ID's
      req.query.ids = [req.user._id];
      await followingController.checkFollowingsPlaylist(req, res, next);
      expect(res.send.mock.calls[0][0]).toEqual([true]);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });

    it('Should return array of falses when no followings found', async () => {
      mockingoose(PlaylistFollowings).toReturn([], 'find');
      // two valid ID's
      req.query.ids = ['5e6ba8747d3eda317003c976'];
      await followingController.checkFollowingsPlaylist(req, res, next);
      expect(res.send.mock.calls[0][0]).toEqual(
        expect.arrayContaining([false])
      );
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });
  });

  describe('getUserFollowed', () => {
    beforeEach(() => {
      user = new User({
        displayName: 'test',
        verified: true,
        images: []
      });
      artist = new Artist({
        user: user._id
      });
      following = new Followings({
        userId: '5e6ba8747d3eda317003c976',
        followedId: user._id,
        type: 'User'
      });
      req.user = following.userId;
      next = jest.fn();
    });
    it('Should return a list of followed users wrapped in paging object', async () => {
      const doc = {
        _id: user._id,
        displayName: user.displayName,
        verified: true,
        images: user.images
      };
      mockingoose(Followings).toReturn([doc], 'aggregate');
      mockingoose(Followings).toReturn(1, 'countDocuments');
      // two valid ID's
      req.query = {
        type: 'User',
        limit: 2,
        offset: 0
      };
      await followingController.getUserFollowed(req, res, next);
      expect(res.json.mock.calls[0][0]).toEqual({
        items: [doc],
        limit: req.query.limit,
        offset: req.query.offset,
        total: 1
      });
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });

    it('Should return a list of followed artists wrapped in paging object', async () => {
      const doc = {
        _id: artist._id,
        displayName: user.displayName,
        images: user.images
      };
      mockingoose(Followings).toReturn([doc], 'aggregate');
      mockingoose(Followings).toReturn(2, 'countDocuments');
      // two valid ID's
      req.query = {
        type: 'Artist',
        limit: 2,
        offset: 1
      };
      await followingController.getUserFollowed(req, res, next);
      expect(res.json.mock.calls[0][0]).toEqual({
        items: [doc],
        limit: req.query.limit,
        offset: req.query.offset,
        total: 2
      });
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });
  });
});
