const requestMocks = require('../../utils/request.mock.js');
const { libraryService } = require('../../../src/services');
let { likedAlbums,likedTracks,Track,Album } = require('../../../src/models');
const mockingoose = require('mockingoose').default;

const trackId = ['5e6c8ebb8b40fc5508fe8b89','5e6c8ebb8b40fc5508fe8b80'];
const albumId = ['5e6c8ebb8b40fc5508fe8b32','5e6c8ebb8b40fc5508fe8b31'];
const userId = '5e6c8ebb8b40fc7708fe8b33';

describe('library service', () => {
  let savedTrack;
  let req;
  let res;
  let next;
  let savedTracks;
  let savedAlbums;
  let savedAlbum;
  let album;
  beforeEach(() => {
    album = new Album({
      album_type: 'single',
      album_group: 'compilation',
      artists: userId,
      genres: ['5e6c8ebb8b40fc5518fe8b32'],
      image: 'example.jpg',
      name: 'The Begining',
      release_date: '12-06-1999',
      tracks: [albumId[0]]
    });
    savedTrack = new likedTracks({
      userId: userId,
      track: trackId[0],
      addedAt: Date.now()
    });
    savedAlbum = new likedAlbums({
      userId: userId,
      album: albumId[0],
      addedAt: Date.now()
    });
    savedAlbums = [savedAlbum];
    savedTracks = [savedTrack];
    req = { params: {}, query: {}, body: {} , baseUrl:"" , user:{} };
    res = requestMocks.mockResponse();
    next = jest.fn();
  });

  describe('checkSavedTrack - test', () => {
    it('should return array of boolean ', async () => {
      req.user = { id: userId };
      likedTracks.select = jest.fn().mockReturnThis();
      mockingoose(likedTracks).toReturn(savedTracks, 'find');
      const check = await libraryService.checkTracks(req.user,trackId);
      expect(check).toEqual([true,false]);
    });
  });
  describe('checkSavedAlbum - test', () => {
    it('should return array of boolean ', async () => {
      req.user = { id: userId };
      likedAlbums.select = jest.fn().mockReturnThis();
      mockingoose(likedAlbums).toReturn(savedAlbums, 'find');
      const check = await libraryService.checkAlbums(req.user,albumId);
      expect(check).toEqual([true,false]);
    });
  });
  describe('getSavedTracks - test', () => {
    it('should return array of savedTracks ', async () => {
      req.user = { id: userId };
      req.query = {
        offset:0,
        limit:1
      }
      likedTracks.select = jest.fn().mockReturnThis();
      likedTracks.populate = jest.fn().mockReturnThis();
      likedTracks.skip = jest.fn().mockReturnThis();
      likedTracks.limit = jest.fn().mockReturnThis();
      mockingoose(likedTracks).toReturn(savedTracks, 'find');
      const tracks = await libraryService.getTracks(req.user,req.query);
      expect(tracks.tracks.toString).toBe(savedTracks.toString);
    });
  });
  describe('getSavedAlbums - test', () => {
    it('should return array of savedAlbums ', async () => {
      req.user = { id: userId };
      req.query = {
        offset:0,
        limit:1
      }
      likedAlbums.select = jest.fn().mockReturnThis();
      likedAlbums.populate = jest.fn().mockReturnThis();
      likedAlbums.skip = jest.fn().mockReturnThis();
      likedAlbums.limit = jest.fn().mockReturnThis();
      savedAlbums[0].album = album;
      mockingoose(likedAlbums).toReturn(savedAlbums, 'find');
      const albums = await libraryService.getAlbums(req.user,req.query);
      expect(albums.albums.toString).toBe(savedAlbums.toString);
    });
  });
  describe('SaveAlbum - test', () => {
    it('should pass even if the tracks send donot exit but it will not save anything ', async () => {
      req.user = { id: userId };
      mockingoose(Album).toReturn(savedAlbum, 'findOne');
      mockingoose(likedAlbums).toReturn(savedAlbum, 'create');
      await libraryService.saveAlbums(req.user,albumId);
    });
  });
  describe('SaveTrack - test', () => {
    it('should pass even if the tracks send donot exit but it will not save anything ', async () => {
      req.user = { id: userId };
      mockingoose(Track).toReturn(savedTrack, 'findOne');
      mockingoose(likedTracks).toReturn(savedTrack, 'create');
      await libraryService.saveTracks(req.user,trackId);
    });
  });
  describe('DeleteTrack - test', () => {
    it('should delete tracks from ids', async () => {
      req.user = { id: userId };
      mockingoose(likedTracks).toReturn(savedTrack, 'deleteMany');
      await libraryService.deleteSavedTracks(req.user,trackId);
    });
  });
  describe('DeleteAlbum - test', () => {
    it('should delete albums from ids', async () => {
      req.user = { id: userId };
      mockingoose(likedAlbums).toReturn(savedAlbum, 'deleteMany');
      await libraryService.deleteSavedAlbums(req.user,trackId);
    });
  });    
});
