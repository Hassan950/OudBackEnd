const { Album } = require('../../../src/models');

describe('Album Model', () => {
  let album;
  beforeEach(() => {
    album = new Album({
      album_type: 'single',
      album_group: 'album',
      genres: '5e6c8ebb8b40fc5508fe8b32',
      image: 'lol.png',
      name: 'neon jungle',
      artists: '5e6c8ebb8b40fc5508fe8b32',
      release_date: '22-06-1999'
    });
  });
  it('Should return undefined when validating a valid album', () => {
    expect(album.validateSync()).toBeUndefined();
  });
  it('Should throw an error if no name passed', () => {
    album.name = null;
    expect(album.validateSync().errors['name']).toBeDefined();
  });
  it('Should throw an error if name is less than 2 characters', () => {
    album.name = '';
    expect(album.validateSync().errors['name']).toBeDefined();
  });
  it('Should throw an error if name is longer than 30 characters', () => {
    album.name = 'more than thirty character long ';
    expect(album.validateSync().errors['name']).toBeDefined();
  });
  it("Should throw an error if no artists ID's were passed (empty list or no list at all)", () => {
    album.artists = null;
    expect(album.validateSync().errors['artists']).toBeDefined();
    album.artists = [];
    expect(album.validateSync().errors['artists']).toBeDefined();
  });
  it('Should throw an error if album_type value is not one of ["single","compilation","album"]', () => {
    album.album_type = 'lol';
    expect(album.validateSync().errors['album_type']).toBeDefined();
  });
  it("Should throw an error if no artists ID's were passed (empty list or no list at all)", () => {
    album.artists = null;
    expect(album.validateSync().errors['artists']).toBeDefined();
    album.artists = [];
    expect(album.validateSync().errors['artists']).toBeDefined();
  });
  it("Should throw an error if no genre ID's were passed (empty list or no list at all)", () => {
    album.genres = null;
    expect(album.validateSync().errors['genres']).toBeDefined();
    album.genres = [];
    expect(album.validateSync().errors['genres']).toBeDefined();
  });
  it("Should throw an error if image doesn't match image format files", () => {
    album.image = 'not png';
    expect(album.validateSync().errors['image']).toBeDefined();
  });
  it("Should throw an error if release_date doesn't match image format DD-MM-YYYY", () => {
    album.release_date = '12-1-199';
    expect(album.validateSync().errors['release_date']).toBeDefined();
  });
  it('Should throw an error if release_date is empty', () => {
    album.release_date = null;
    expect(album.validateSync().errors['release_date']).toBeDefined();
  });
});
