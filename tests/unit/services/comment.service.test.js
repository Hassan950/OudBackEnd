const requestMocks = require('../../utils/request.mock.js');
const { commentService } = require('../../../src/services');
let { AlbumComments,PlaylistComments,User,Album,Playlist } = require('../../../src/models');
const mockingoose = require('mockingoose').default;

const playlistId = '5e6c8ebb8b40fc5508fe8b89'
const albumId = '5e6c8ebb8b40fc5508fe8b32'
const userId = '5e6c8ebb8b40fc7708fe8b33';

describe('library service', () => {
  let playlistComment;
  let req;
  let res;
  let next;
  let playlist;
  let playlistComments;
  let albumComment;
  let albumComments;
  let user;
  beforeEach(() => {
    playlist = new Playlist({
      name: 'playlist1',
      public: true,
      collabrative: true,
      description: 'dsjbfjdbgjksdn',
      owner: '5e6c8ebb8b40fc7708fe8b74',
      tracks: albumId,
      image: 'uploads\\default.jpg'
    });
    album = new Album({
      album_type: 'single',
      album_group: 'compilation',
      artists: userId,
      genres: ['5e6c8ebb8b40fc5518fe8b32'],
      image: 'example.jpg',
      name: 'The Begining',
      release_date: '12-06-1999',
      tracks: albumId
    });
    playlistComment = new PlaylistComments({
      userName: "Messi",
      playlistId: playlistId,
      comment: "wow"
    });
    user = new User({
      displayName: 'Ahmed'
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

  describe('getAlbumComment - test', () => {
    it('should return array of comments ', async () => {
      params = {
        id: albumId
      }
      query = {
        offset: 0,
        limit: 2
      };
      AlbumComments.select = jest.fn().mockReturnThis();
      AlbumComments.skip = jest.fn().mockReturnThis();
      AlbumComments.limit = jest.fn().mockReturnThis();
      mockingoose(AlbumComments).toReturn(albumComments, 'find');
      mockingoose(AlbumComments).toReturn(2, 'countDocuments');
      const check = await commentService.getAlbumComment(params,query);
      expect(toString(check.comments)).toEqual(toString(albumComments));
    });
  });
  describe('getPlaylistComment - test', () => {
    it('should return array of comments ', async () => {
      params = {
        id: albumId
      }
      query = {
        offset: 0,
        limit: 2
      };
      PlaylistComments.select = jest.fn().mockReturnThis();
      PlaylistComments.skip = jest.fn().mockReturnThis();
      PlaylistComments.limit = jest.fn().mockReturnThis();
      mockingoose(PlaylistComments).toReturn(playlistComments, 'find');
      mockingoose(PlaylistComments).toReturn(2, 'countDocuments');
      const check = await commentService.getPlaylistComment(params,query);
      expect(toString(check.comments)).toEqual(toString(playlistComments));
    });
  });
  describe('getUserName - test', () => {
    it('should return name of user ', async () => {
      mockingoose(User).toReturn(user, 'findOne');
      const check = await commentService.getUserName(userId);
      expect(check).toEqual(user.displayName);
    });
  });
  describe('getPlaylist - test', () => {
    it('should return Playlist ', async () => {
      mockingoose(Playlist).toReturn(playlist, 'findOne');
      const check = await commentService.getPlaylist(playlistId);
      expect(check).toEqual(playlist);
    });
  });
  describe('getAlbum - test', () => {
    it('should return Album ', async () => {
      mockingoose(Album).toReturn(album, 'findOne');
      const check = await commentService.getAlbum(albumId);
      expect(check).toEqual(album);
    });
  });
  describe('makeAlbumComment - test', () => {
    it('should create an album', async () => {
      params = {
        id: albumId
      }
      body = {
        comment: "k"
      }
      Name = "m";
      mockingoose(AlbumComments).toReturn(albumComment,'create');
      await commentService.makeAlbumComment(params,Name,body);
    });
  });
  describe('makePlaylistComment - test', () => {
    it('should create a playlist', async () => {
      params = {
        id: playlistId
      }
      body = {
        comment: "k"
      }
      Name = "m";
      mockingoose(PlaylistComments).toReturn(playlistComment,'create');
      await commentService.makePlaylistComment(params,Name,body);
    });
  });
});
