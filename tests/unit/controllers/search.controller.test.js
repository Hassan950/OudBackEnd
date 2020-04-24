const requestMocks = require('../../utils/request.mock.js');
const { searchController } = require('../../../src/controllers');
const { searchService } = require('../../../src/services');
let { Recent } = require('../../../src/models');

const trackId ='5e6c8ebb8b40fc5508fe8b89';
const albumId = '5e6c8ebb8b40fc5508fe8b32';
const userId = '5e6c8ebb8b40fc7708fe8b33'

describe('library controllers', () => {
  let recent ;
  let recentarray;
  beforeEach(() => {
    recent = new Recent({
      userId:'5e909be7cfe5b521a0ccf3ec',
      items:['5e909be7cfe5b521a0ccf3ed'],
      types:['5e909be7cfe5b521a0ccf3ee']
    });
    recentarray = [recent];
    req = { params: {}, query: {}, body: {} , baseUrl:"" , user:{} };
    res = requestMocks.mockResponse();
    next = jest.fn();
  });

  describe('search - test', () => {
    it('should throw 404 if baseUrl contain me ', async () => {
      req.baseUrl = "me" 
      req.query.q = 'i';
      await searchController.search(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should pass and return ', async () => { 
      req.query.q = 'i';
      searchService.search = async()=>{
        return recentarray
      }
      await searchController.search(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
  });
  describe('AddTORecent - test', () => {
    it('should throw 404 if baseUrl is /api/v1/search/ ', async () => {
      req.baseUrl = "/api/v1/search" 
      req.body.id = '5e909be7cfe5b521a0ccf3ed';
      req.body.type = 'playlist';
      await searchController.addTORecent(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw 404 if baseUrl is /api/v1/search/ ', async () => {
      req.body.id = '5e909be7cfe5b521a0ccf3ed';
      req.body.type = 'playlist';
      searchService.addToRecent = async()=>{
        return;
      }
      await searchController.addTORecent(req, res, next);
      expect(res.sendStatus.mock.calls[0][0]).toBe(200);
    });
  });
  describe('getRecent - test', () => {
    it('should throw 404 if baseUrl is /api/v1/search/ ', async () => {
      req.baseUrl = "/api/v1/search" 
      await searchController.getRecent(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw 404 if baseUrl is /api/v1/search/ ', async () => {
      searchService.getRecent = async()=>{
        return  recentarray;
      }
      await searchController.getRecent(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
  });  
});
