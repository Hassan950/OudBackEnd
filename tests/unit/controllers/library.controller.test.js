const requestMocks = require('../../utils/request.mock.js');
const { libraryController } = require('../../../src/controllers');
const { libraryService } = require('../../../src/services');
let { likedAlbums,likedTracks } = require('../../../src/models');
const mockingoose = require('mockingoose').default;

const trackId ='5e6c8ebb8b40fc5508fe8b89';
const albumId = '5e6c8ebb8b40fc5508fe8b32';
const userId = '5e6c8ebb8b40fc7708fe8b33'

describe('library controllers', () => {
  let savedTrack;
  let req;
  let res;
  let next;
  let savedTracks;
  let savedAlbums;
  let savedAlbum;
  beforeEach(() => {
    savedTrack = new likedTracks({
      userId: userId,
      track: trackId,
      addedAt: Date.now()
    });
    savedAlbum = new likedAlbums({
      userId: userId,
      album: albumId,
      addedAt: Date.now()
    });
    savedAlbums = [savedAlbum, savedAlbum];
    savedTracks = [savedTrack, savedTrack];
    req = { params: {}, query: {}, body: {} , baseUrl:"" , user:{} };
    res = requestMocks.mockResponse();
    next = jest.fn();
  });

  describe('checkSavedTrack - test', () => {
    it('should return 200 ', async () => {
      req.baseUrl = "tracks"
      req.user =
      {
        id:userId
      } 
      req.query.ids = trackId,trackId;
      libraryService.checkTracks = async()=>{
        return [true];
      }
      await libraryController.check(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return array of boolean where track is saved or not', async () => {
      req.baseUrl = "tracks"
      req.user =
      {
        id:userId
      } 
      req.query.ids = trackId;
      libraryService.checkTracks = async()=>{
        return [true];
      }
      await libraryController.check(req, res, next);
      const check = res.json.mock.calls[0][0].isFound;
      expect(check).toEqual([true]);
    });
  });  
  describe('checkSavedAlbum - test', () => {
    it('should return 200 ', async () => {
      req.baseUrl = "albums"
      req.user =
      {
        id:userId
      } 
      req.query.ids = albumId;
      libraryService.checkAlbums = async()=>{
        return [true];
      }
      await libraryController.check(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return array of boolean where album is saved or not', async () => {
      req.baseUrl = "albums"
      req.user =
      {
        id:userId
      } 
      req.query.ids = albumId;
      libraryService.checkAlbums = async()=>{
        return [true];
      }
      await libraryController.check(req, res, next);
      const check = res.json.mock.calls[0][0].isFound;
      expect(check).toEqual([true]);
    });  
  });
  describe('getSavedAlbum - test', () => {
    it('should return 200 ', async () => {
      req.baseUrl = "albums"
      req.user =
      {
        id:userId
      } 
      libraryService.getAlbums = async()=>{
        return savedAlbums;
      }
      await libraryController.get(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return array of savedAlbumss', async () => {
      req.baseUrl = "albums"
      req.user =
      {
        id:userId
      } 
      libraryService.getAlbums = async()=>{
        return savedAlbums;
      }
      await libraryController.get(req, res, next);
      const check = res.json.mock.calls[0][0].items;
      expect(check).toEqual(savedAlbums);
    });  
  });
  describe('getSavedTrack - test', () => {
    it('should return 200 ', async () => {
      req.baseUrl = "tracks"
      req.user =
      {
        id:userId
      } 
      libraryService.getTracks = async()=>{
        return savedTracks;
      }
      await libraryController.get(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return array of savedAlbumss', async () => {
      req.baseUrl = "tracks"
      req.user =
      {
        id:userId
      } 
      libraryService.getTracks = async()=>{
        return savedTracks;
      }
      await libraryController.get(req, res, next);
      const check = res.json.mock.calls[0][0].items;
      expect(check).toEqual(savedTracks);
    });  
  });
  describe('SaveTrack - test', () => {
    it('should return 200 ', async () => {
      req.baseUrl = "tracks"
      req.user =
      {
        id:userId
      } 
      req.query.ids = trackId;
      libraryService.saveTracks = async()=>{
        return ;
      }
      await libraryController.put(req, res, next);
      expect(res.sendStatus.mock.calls[0][0]).toBe(201);
    });  
  });
  describe('SaveAlbum - test', () => {
    it('should return 200 ', async () => {
      req.baseUrl = "albums"
      req.user =
      {
        id:userId
      } 
      req.query.ids = albumId;
      libraryService.saveAlbums = async()=>{
        return ;
      }
      await libraryController.put(req, res, next);
      expect(res.sendStatus.mock.calls[0][0]).toBe(201);
    });  
  });
  describe('deleteTrack - test', () => {
    it('should return 200 ', async () => {
      req.baseUrl = "tracks"
      req.user =
      {
        id:userId
      } 
      req.query.ids = trackId;
      libraryService.deleteSavedTracks = async()=>{
        return ;
      }
      await libraryController.delete(req, res, next);
      expect(res.sendStatus.mock.calls[0][0]).toBe(204);
    });  
  });
  describe('deleteAlbum - test', () => {
    it('should return 200 ', async () => {
      req.baseUrl = "albums"
      req.user =
      {
        id:userId
      } 
      req.query.ids = albumId;
      libraryService.deleteSavedAlbums = async()=>{
        return ;
      }
      await libraryController.delete(req, res, next);
      expect(res.sendStatus.mock.calls[0][0]).toBe(204);
    });  
  });  
});
