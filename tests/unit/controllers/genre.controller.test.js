const { genreController } = require('../../../src/controllers');
const mockingoose = require('mockingoose').default;
const requestMocks = require('../../utils/request.mock');
let { Genre } = require('../../../src/models');

describe('Genre Controller', () => {
  let req;
  let res;
  let next;
  let genre;
  let genres;
  beforeEach(() => {
    genre = new Genre({
      name: 'The Begining'
    });
    genres = [genre, genre];
    req = { params: {}, query: {}, body: {} };
    res = requestMocks.mockResponse();
    next = jest.fn();
  });
  describe('get Genre', () => {
    it('Should return the genre with the given ID with status code 200', async () => {
      mockingoose(Genre).toReturn(genre, 'findOne');
      await genreController.getGenre(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0]).toHaveProperty('name');
    });
    it('Should throw an error with status code 404 if the genre was not found', async () => {
      mockingoose(Genre).toReturn(null, 'findOne');
      await genreController.getGenre(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  describe('get Genres', () => {
    it('Should return genres in a paging object with status code 200', async () => {
      mockingoose(Genre).toReturn(genres, 'find');
      await genreController.getGenres(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
      expect(res.json.mock.calls[0][0]).toHaveProperty('items');
    });
    it('Should return 500 if no genres were found with status code 500', async () => {
      mockingoose(Genre).toReturn(null, 'find');
      await genreController.getGenres(req, res, next);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
      
    })
  });
});
