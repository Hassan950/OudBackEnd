const { Genre } = require('../../../src/models');

describe('Genre model', () => {
  let genre;
  beforeEach(() => {
    genre = new Genre({
      name: 'genre'
    });
  });
  it('Should return undefined when validating a valid genre', () => {
    expect(genre.validateSync()).toBeUndefined();
  });
  it('Should throw an error if no name passed', () => {
    genre.name = null;
    expect(genre.validateSync().errors['name']).toBeDefined();
  });
  it('Should throw an error if name is less than 2 characters', () => {
    genre.name = 'I';
    expect(genre.validateSync().errors['name']).toBeDefined();
  });
  it('Should throw an error if name is longer than 20 characters', () => {
    genre.name = 'more than twenty character long ';
    expect(genre.validateSync().errors['name']).toBeDefined();
  });
});
