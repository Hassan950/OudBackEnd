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
        images: [],
        type: 'User'
      });
      artist = new Artist();

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
          images: user.images,
          displayName: user.displayName
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
        displayName: artistFollowing.followedId.displayName,
        type: artistFollowing.followedId.type,
        images: artistFollowing.followedId.images
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
        displayName: artistFollowing.followedId.displayName,
        type: artistFollowing.followedId.type,
        images: artistFollowing.followedId.images
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

    it('Should return http status 404 if the passed id is not associated with a user', async () => {
      req.url = 'users';
      mockingoose(User).toReturn(undefined, 'findOne');
      req.query = {
        type: 'User',
        limit: 2,
        offset: 1
      };
      await followController.getUserFollowed(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.NOT_FOUND);
    });
  });

  describe('setUserId', () => {
    it('Should call next function and assign req.user._id to req.params.userId', async () => {
      req.user = { _id: 'ValidId' };
      followController.setUserId(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(req.params).toBeDefined();
      expect(req.params.userId).toEqual(req.user._id);
    });
  });

  describe('getUserFollowers', () => {
    beforeEach(() => {
      Followings.schema.path('userId', Object);
      User.schema.path('artist', Object);
      Artist.schema.path('user', Object);

      user = new User({
        displayName: 'test',
        verified: true,
        images: []
      });

      userFollowing = new Followings({
        userId: {
          _id: user._id,
          images: user.images,
          verified: user.verified,
          displayName: user.displayName
        },
        followedId: '5e6ba8747d3eda317003c976',
        type: 'User'
      });

      mockingoose(Artist).toReturn(artist);
      mockingoose(User).toReturn(user);
      req.user = { _id: following.userId };
      next = jest.fn();
    });
    it('Should return a list of followers users of the logged in user wrapped in paging object', async () => {
      const doc = userFollowing.userId;
      mockingoose(Followings).toReturn([userFollowing], 'find');
      mockingoose(Followings).toReturn(1, 'countDocuments');
      req.query = {
        limit: 2,
        offset: 0
      };
      await followController.getUserFollowers(req, res, next);
      expect(res.json.mock.calls[0][0]).toEqual({
        items: [doc],
        limit: req.query.limit,
        offset: req.query.offset,
        total: 1
      });
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.OK);
    });
  });

  describe('followUser', () => {
    beforeEach(() => {
      user = new User({
        displayName: 'test',
        verified: true,
        images: []
      });

      artist = new Artist({
        user: user._id
      });
      req.user = { _id: user._id };
      next = jest.fn();
      res.end = jest.fn();
    });
    it('Should return bad request 400 if there is no req.query.ids nor req.body.ids', async () => {
      await followController.followUser(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.BAD_REQUEST);
    });
    it('Should return not found 404 if there is at least one invalid userId in query', async () => {
      req.query = {
        type: 'User',
        ids: ['invalidId', user._id]
      };
      mockingoose(User).toReturn([user]);
      await followController.followUser(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.NOT_FOUND);
    });
    it('Should return not found 404 if there is at least one invalid artistId in query', async () => {
      req.query = {
        type: 'Artist',
        ids: ['invalidId', artist._id]
      };
      mockingoose(Artist).toReturn([artist]);
      await followController.followUser(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.NOT_FOUND);
    });
    it('Should return no content 204 when it follow user successfully in query', async () => {
      req.query = {
        type: 'User',
        ids: [user._id]
      };
      mockingoose(User).toReturn([user]);
      await followController.followUser(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.NO_CONTENT);
    });
    it('Should return no content 204 when it follow artist successfully in query', async () => {
      req.query = {
        type: 'Artist',
        ids: [artist._id]
      };
      mockingoose(Artist).toReturn([artist]);
      await followController.followUser(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.NO_CONTENT);
    });

    it('Should return not found 404 if there is at least one invalid userId in body', async () => {
      req.query = {
        type: 'User',
      };
      req.body = {
        ids: ['invalidId', user._id]
      }
      mockingoose(User).toReturn([user]);
      await followController.followUser(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.NOT_FOUND);
    });
    it('Should return not found 404 if there is at least one invalid artistId in body', async () => {
      req.query = {
        type: 'Artist',
      };
      req.body = {
        ids: ['invalidId', artist._id]
      }
      mockingoose(Artist).toReturn([artist]);
      await followController.followUser(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.NOT_FOUND);
    });
    it('Should return no content 204 when it follow user successfully in body', async () => {
      req.query = {
        type: 'User',
      };
      req.body = {
        ids: [user._id]
      }
      mockingoose(User).toReturn([user]);
      await followController.followUser(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.NO_CONTENT);
    });
    it('Should return no content 204 when it follow artist successfully in body', async () => {
      req.query = {
        type: 'Artist',
      };
      req.body = {
        ids: [artist._id]
      }
      mockingoose(Artist).toReturn([artist]);
      await followController.followUser(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.NO_CONTENT);
    });
  });

  describe('unfollowUser', () => {
    beforeEach(() => {
      user = new User({
        displayName: 'test',
        verified: true,
        images: []
      });

      artist = new Artist({
        user: user._id
      });
      req.user = { _id: user._id };
      next = jest.fn();
      res.end = jest.fn();
    });
    it('Should return bad request 400 if there is no req.query.ids nor req.body.ids', async () => {
      await followController.unfollowUser(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.BAD_REQUEST);
    });
    it('Should return not found 404 if there is at least one invalid userId in query', async () => {
      req.query = {
        type: 'User',
        ids: ['invalidId', user._id]
      };
      mockingoose(User).toReturn([user]);
      await followController.unfollowUser(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.NOT_FOUND);
    });
    it('Should return not found 404 if there is at least one invalid userId in body', async () => {
      req.query = {
        type: 'User'
      };
      req.body = {
        ids: ['invalidId', user._id]
      };
      mockingoose(User).toReturn([user]);
      await followController.unfollowUser(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.NOT_FOUND);
    });
    it('Should return not found 404 if there is at least one invalid artistId in query', async () => {
      req.query = {
        type: 'Artist',
        ids: ['invalidId', artist._id]
      };
      mockingoose(Artist).toReturn([artist]);
      await followController.unfollowUser(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.NOT_FOUND);
    });
    it('Should return not found 404 if there is at least one invalid artistId in body', async () => {
      req.query = {
        type: 'Artist'
      };
      req.body = {
        ids: ['invalidId', user._id]
      };
      mockingoose(Artist).toReturn([artist]);
      await followController.unfollowUser(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.NOT_FOUND);
    });
    it('Should return no content 204 when it unfollow user successfully in query', async () => {
      req.query = {
        type: 'User',
        ids: [user._id]
      };
      mockingoose(User).toReturn([user]);
      await followController.unfollowUser(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.NO_CONTENT);
    });
    it('Should return no content 204 when it unfollow artist successfully in query', async () => {
      req.query = {
        type: 'Artist',
        ids: [artist._id]
      };
      mockingoose(Artist).toReturn([artist]);
      await followController.unfollowUser(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.NO_CONTENT);
    });
    it('Should return no content 204 when it unfollow user successfully in body', async () => {
      req.query = {
        type: 'User'
      };
      req.body = {
        ids: [user._id]
      };
      mockingoose(User).toReturn([user]);
      await followController.unfollowUser(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.NO_CONTENT);
    });
    it('Should return no content 204 when it unfollow artist successfully in body', async () => {
      req.query = {
        type: 'Artist'
      };
      req.body = {
        ids: [artist._id]
      };
      mockingoose(Artist).toReturn([artist]);
      await followController.unfollowUser(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.NO_CONTENT);
    });
  });

  describe('followPlaylist', () => {
    beforeEach(() => {
      user = new User({
        displayName: 'test',
        verified: true,
        images: []
      });
      playlist = new Playlist();
      req.user = { _id: user._id };
      next = jest.fn();
      res.end = jest.fn();
    });
    it('Should return bad request 404 if there is no playlist with this id', async () => {
      mockingoose(Playlist).toReturn(undefined, 'findOne');
      req.params = {
        playlistId: playlist._id
      };
      req.body = {
        public: true
      };
      await followController.followPlaylist(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.NOT_FOUND);
    });
    it('Should return no content 204 if user successfully followed the playlist', async () => {
      mockingoose(Playlist).toReturn([playlist], 'findOne');
      req.params = {
        playlistId: playlist._id
      };
      req.body = {
        public: true
      };
      await followController.followPlaylist(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.NO_CONTENT);
    });
  });

  describe('unfollowPlaylist', () => {
    beforeEach(() => {
      user = new User({
        displayName: 'test',
        verified: true,
        images: []
      });
      playlist = new Playlist();
      req.user = { _id: user._id };
      next = jest.fn();
      res.end = jest.fn();
    });
    it('Should return bad request 404 if there is no playlist with this id', async () => {
      mockingoose(Playlist).toReturn(undefined, 'findOne');
      req.params = {
        playlistId: playlist._id
      };
      await followController.unfollowPlaylist(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(httpStatus.NOT_FOUND);
    });
    it('Should return no content 204 if user successfully unfollowed the playlist', async () => {
      mockingoose(Playlist).toReturn([playlist], 'findOne');
      req.params = {
        playlistId: playlist._id
      };
      await followController.unfollowPlaylist(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(httpStatus.NO_CONTENT);
    });
  });
});
