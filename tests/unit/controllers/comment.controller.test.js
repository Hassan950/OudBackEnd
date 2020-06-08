const requestMocks = require('../../utils/request.mock.js');
const { commentController } = require('../../../src/controllers');
const { commentService } = require('../../../src/services');
let { PlaylistComments, AlbumComments } = require('../../../src/models');
const mockingoose = require('mockingoose').default;

const playlistId = '5e6c8ebb8b40fc5508fe8b89';
const albumId = '5e6c8ebb8b40fc5508fe8b32';
const userId = '5e6c8ebb8b40fc5508fe8b88';

describe('comment controllers', () => {
  let playlistComment;
  let req;
  let res;
  let next;
  let playlistComments;
  let albumComment;
  let albumComments;
  beforeEach(() => {
    playlistComment = new PlaylistComments({
      userName: "Messi",
      playlistId: playlistId,
      comment: "wow"
    });
    albumComment = new AlbumComments({
      userId: userId,
      album: albumId,
      addedAt: Date.now()
    });
    albumComments = [albumComment, albumComment];
    playlistComments = [playlistComment, playlistComment];
    req = { params: {}, query: {}, body: {}, baseUrl: "", user: {} };
    res = requestMocks.mockResponse();
    next = jest.fn();
  });

  describe('getPlaylistComment - test', () => {
    it('should return 200 ', async () => {
      req.baseUrl = "playlists"
      req.user =
      {
        id: userId
      }
      req.params = {
        id: playlistId
      };
      req.query = {
        offset: 0,
        limit: 2
      };
      commentService.getPlaylistComment = async () => {
        const total = 2;
        const comments = playlistComments;
        return { comments, total };
      }
      await commentController.getComments(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return array of comments on this playlist', async () => {
      req.baseUrl = "playlists"
      req.user =
      {
        id: userId
      }
      req.params = {
        id: playlistId
      };
      req.query = {
        offset: 0,
        limit: 2
      };
      commentService.getPlaylistComment = async () => {
        const total = 2;
        const comments = playlistComments;
        return { comments, total };
      }
      await commentController.getComments(req, res, next);
      const check = res.json.mock.calls[0][0].comments;
      expect(check).toEqual(playlistComments);
    });
  });
  describe('getAlbumComment - test', () => {
    it('should return 200 ', async () => {
      req.baseUrl = "albums"
      req.user =
      {
        id: userId
      }
      req.params = {
        id: albumId
      };
      req.query = {
        offset: 0,
        limit: 2
      };
      commentService.getAlbumComment = async () => {
        const total = 2;
        const comments = albumComments;
        return { comments, total };
      }
      await commentController.getComments(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return array of comments on this playlist', async () => {
      req.baseUrl = "albums"
      req.user =
      {
        id: userId
      }
      req.params = {
        id: albumId
      };
      req.query = {
        offset: 0,
        limit: 2
      };
      commentService.getAlbumComment = async () => {
        const total = 2;
        const comments = albumComments;
        return { comments, total };
      }
      await commentController.getComments(req, res, next);
      const check = res.json.mock.calls[0][0].comments;
      expect(check).toEqual(albumComments);
    });
  });
  describe('makeAlbumComment - test', () => {
    it('should return 204 ', async () => {
      req.baseUrl = "albums"
      req.user =
      {
        id: userId
      }
      req.params = {
        id: albumId
      };
      req.query = {
        offset: 0,
        limit: 2
      };
      commentService.makeAlbumComment = async () => {
        return ;
      }
      commentService.getUserName = async () => { 
        return "m";
      }
      commentService.getAlbum = async () => { 
        return albumId;
      }
      await commentController.makeComments(req, res, next);
      expect(res.sendStatus.mock.calls[0][0]).toBe(204);
    });
    it('should return error if album not found ', async () => {
      req.baseUrl = "albums"
      req.user =
      {
        id: userId
      }
      req.params = {
        id: albumId
      };
      req.query = {
        offset: 0,
        limit: 2
      };
      commentService.makeAlbumComment = async () => {
        return ;
      }
      commentService.getUserName = async () => { 
        return "m";
      }
      commentService.getAlbum = async () => { 
        return null;
      }
      await commentController.makeComments(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  describe('makePlaylistComment - test', () => {
    it('should return 204 ', async () => {
      req.baseUrl = "playlists"
      req.user =
      {
        id: userId
      }
      req.params = {
        id: playlistId
      };
      req.query = {
        offset: 0,
        limit: 2
      };
      commentService.makePlaylistComment = async () => {
        return ;
      }
      commentService.getUserName = async () => { 
        return "m";
      }
      commentService.getPlaylist = async () => { 
        return playlistId;
      }
      await commentController.makeComments(req, res, next);
      expect(res.sendStatus.mock.calls[0][0]).toBe(204);
    });
    it('should return error if playlist not found ', async () => {
      req.baseUrl = "playlists"
      req.user =
      {
        id: userId
      }
      req.params = {
        id: playlistId
      };
      req.query = {
        offset: 0,
        limit: 2
      };
      commentService.makePlaylistComment = async () => {
        return ;
      }
      commentService.getUserName = async () => { 
        return "m";
      }
      commentService.getPlaylist = async () => { 
        return null;
      }
      await commentController.makeComments(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
});
