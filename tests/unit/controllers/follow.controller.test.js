const { followController } = require('../../../src/controllers/');
const {
  Followings,
  PlaylistFollowings,
  User,
  Artist,
  Playlist
} = require('../../../src/models');
const AppError = require('../../../src/utils/AppError');
const httpStatus = require('http-status');
const requestMocks = require('../../utils/request.mock');
const mockingoose = require('mockingoose').default;

describe('Following controller', () => {
  let req;
  let res;
  let next;
  let following;
  let playlist;
  let user;
  let artist;
  let artistFollowing;
  let userFollowing;
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
      req.user = { _id: following.userId };
      next = jest.fn();
    });
    it('Should return list of boolean that indicates the following for each user/artist with status code 200', async () => {
      mockingoose(Followings).toReturn([following], 'find');
      // two valid ID's
      req.query.ids = ['5e6ba6917fb1cf2ad80b4fb2', '5e6ba8747d3eda317003c976'];
      await followController.checkFollowings(req, res, next);
      expect(res.send.mock.calls[0][0]).toEqual(
        expect.arrayContaining([true, false])
      );
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });

    it('Should return an array contains falses when no following found', async () => {
      mockingoose(Followings).toReturn([], 'find');
      // two valid ID's
      req.query.ids = ['5e6ba6917fb1cf2ad80b4fb2', '5e6ba8747d3eda317003c976'];
      await followController.checkFollowings(req, res, next);
      expect(res.send.mock.calls[0][0]).toEqual([false, false]);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });
  });
  describe('checkFollowingsPlaylist', () => {
    beforeEach(() => {
      PlaylistFollowings.schema.path('playlistId', Object);
      following = new PlaylistFollowings({
        userId: '5e6ba8747d3eda317003c976',
        playlistId: '5e6ba6917fb1cf2ad80b4fb2'
      });
      playlist = new Playlist({
        _id: '5e6ba6917fb1cf2ad80b4fb2',
        public: true
      });
    });
    it('Should return list of boolean that indicates whether the user follows this playlist or not with status code 200', async () => {
      mockingoose(PlaylistFollowings).toReturn([following], 'find');
      mockingoose(Playlist).toReturn(playlist, 'findOne');
      // valid ID
      req.query.ids = ['5e6ba8747d3eda317003c976'];
      req.params.playlistId = '5e6ba6917fb1cf2ad80b4fb2';
      await followController.checkFollowingsPlaylist(req, res, next);
      expect(res.send.mock.calls[0][0]).toEqual([true]);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });

    it('Should return an array contains falses when no following found', async () => {
      mockingoose(PlaylistFollowings).toReturn([], 'find');
      mockingoose(Playlist).toReturn(playlist, 'findOne');
      // two valid ID's
      req.query.ids = ['5e6ba6917fb1cf2ad80b4fb2', '5e6ba8747d3eda317003c976'];
      await followController.checkFollowingsPlaylist(req, res, next);
      expect(res.send.mock.calls[0][0]).toEqual([false, false]);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });

    it('Should return false when checking a private playlist', async () => {
      playlist.public = false;
      mockingoose(PlaylistFollowings).toReturn([following], 'find');
      mockingoose(Playlist).toReturn(playlist, 'findOne');
      // two valid ID's
      req.query.ids = ['5e6ba8747d3eda317003c976'];
      await followController.checkFollowingsPlaylist(req, res, next);
      expect(res.send.mock.calls[0][0]).toEqual([false]);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });

    it('If the current user logged in and owns this playlist he is able to see the following even if the playlist is private', async () => {
      playlist.public = false;
      req.user = { _id: '5e6ba8747d3eda317003c976' };
      mockingoose(PlaylistFollowings).toReturn([following], 'find');
      mockingoose(Playlist).toReturn(playlist, 'findOne');
      // two valid ID's
      req.query.ids = [req.user._id];
      await followController.checkFollowingsPlaylist(req, res, next);
      expect(res.send.mock.calls[0][0]).toEqual([true]);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });

    it('Should return array of falses when no followings found', async () => {
      mockingoose(PlaylistFollowings).toReturn([], 'find');
      mockingoose(Playlist).toReturn(playlist, 'findOne');
      // two valid ID's
      req.query.ids = ['5e6ba8747d3eda317003c976'];
      await followController.checkFollowingsPlaylist(req, res, next);
      expect(res.send.mock.calls[0][0]).toEqual(
        expect.arrayContaining([false])
      );
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });
  });

  describe('getUserFollowed', () => {
    beforeEach(() => {
      Followings.schema.path('followedId', Object);
      User.schema.path('artist', Object);
      Artist.schema.path('user', Object);

      user = new User({
        displayName: 'test',
        verified: true,
        images: []
      });
      artist = new Artist({
        user: user._id
      });

      userFollowing = new Followings({
        userId: '5e6ba8747d3eda317003c976',
        followedId: {
          _id: user._id,
          images: user.images,
          verified: user.verified,
          displayName: user.displayName
        },
        type: 'User'
      });

      artistFollowing = new Followings({
        userId: '5e6ba8747d3eda317003c976',
        followedId: {
          _id: artist._id,
          user: {
            _id: user._id,
            images: user.images,
            displayName: user.displayName
          }
        },
        type: 'Artist'
      });

      mockingoose(Artist).toReturn(artist);
      mockingoose(User).toReturn(user);
      req.user = { _id: following.userId };
      next = jest.fn();
    });
    it('Should return a list of followed users of the logged in user wrapped in paging object', async () => {
      req.url = 'me';
      const doc = userFollowing.followedId;
      mockingoose(Followings).toReturn([userFollowing], 'find');
      mockingoose(Followings).toReturn(1, 'countDocuments');
      req.query = {
        type: 'User',
        limit: 2,
        offset: 0
      };
      await followController.getUserFollowed(req, res, next);
      expect(res.json.mock.calls[0][0]).toEqual({
        items: [doc],
        limit: req.query.limit,
        offset: req.query.offset,
        total: 1
      });
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });

    it('Should return a list of followed artists of the logged in user wrapped in paging object', async () => {
      req.url = 'me';
      const doc = {
        _id: artistFollowing.followedId._id,
        displayName: artistFollowing.followedId.user.displayName,
        type: artistFollowing.followedId.type,
        images: artistFollowing.followedId.user.images
      };
      mockingoose(Followings).toReturn([artistFollowing], 'find');
      mockingoose(Followings).toReturn(2, 'countDocuments');
      req.query = {
        type: 'Artist',
        limit: 2,
        offset: 1
      };
      await followController.getUserFollowed(req, res, next);
      expect(res.json.mock.calls[0][0]).toEqual({
        items: [doc],
        limit: req.query.limit,
        offset: req.query.offset,
        total: 2
      });
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });
    it('Should return a list of followed users of the passed user wrapped in paging object', async () => {
      req.url = 'users';
      req.params.userId = req.user._id;
      const doc = userFollowing.followedId;
      mockingoose(Followings).toReturn([userFollowing], 'find');
      mockingoose(User).toReturn(req.user, 'findOne');
      mockingoose(Followings).toReturn(1, 'countDocuments');
      req.query = {
        type: 'User',
        limit: 2,
        offset: 0
      };
      await followController.getUserFollowed(req, res, next);
      expect(res.json.mock.calls[0][0]).toEqual({
        items: [doc],
        limit: req.query.limit,
        offset: req.query.offset,
        total: 1
      });
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });

    it('Should return a list of followed artists of of the passed user wrapped in paging object', async () => {
      req.url = 'users';
      req.params.userId = req.user._id;
      const doc = {
        _id: artistFollowing.followedId._id,
        displayName: artistFollowing.followedId.user.displayName,
        type: artistFollowing.followedId.type,
        images: artistFollowing.followedId.user.images
      };
      mockingoose(Followings).toReturn([artistFollowing], 'find');
      mockingoose(User).toReturn(req.user, 'findOne');
      mockingoose(Followings).toReturn(2, 'countDocuments');
      req.query = {
        type: 'Artist',
        limit: 2,
        offset: 1
      };
      await followController.getUserFollowed(req, res, next);
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
