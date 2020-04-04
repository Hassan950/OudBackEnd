const { Artist } = require('../../../src/models');

describe('Artist model', () => {
  let artist;
  beforeEach(() => {
    artist = new Artist({
      user: '5e6c8ebb8b40fc5508fe8b32',
      genres: '5e6c8ebb8b40fc5508fe8b32',
      images: 'lol.jpg',
      name: 'neon jungle',
      bio: 'not longer than 255',
      popularSongs: '5e6c8ebb8b40fc5508fe8b32'
    });
  });
  it('Should return undefined when validating a valid artist', () => {
    expect(artist.validateSync()).toBeUndefined();
  });
  it('Should throw an error if no name passed', () => {
    artist.name = null;
    expect(artist.validateSync().errors['name']).toBeDefined();
  });
  it('Should throw an error if name is less than 3 characters', () => {
    artist.name = 'hi';
    expect(artist.validateSync().errors['name']).toBeDefined();
  });
  it('Should throw an error if name is longer than 30 characters', () => {
    artist.name = 'more than thirty character long ';
    expect(artist.validateSync().errors['name']).toBeDefined();
  });
  it('Should throw an error if no user ID passed or not a valid object ID', () => {
    artist.user = null;
    expect(artist.validateSync().errors['user']).toBeDefined();
    artist.user = 'lol';
    expect(artist.validateSync().errors['user']).toBeDefined();
  });
  it("Should throw an error if no genre ID's were passed (empty list or no list at all)", () => {
    artist.genres = null;
    expect(artist.validateSync().errors['genres']).toBeDefined();
    artist.genres = [];
    expect(artist.validateSync().errors['genres']).toBeDefined();
  });
  it("Should throw an error if images contains any images that doesn't match image format files", () => {
    artist.images = ['not png', 'png.jgp'];
    expect(artist.validateSync().errors['images.0']).toBeDefined();
  });
  it('Should throw an error if bio is longer than 255 characters', () => {
    artist.bio =
      'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. I am so happy,';
    expect(artist.validateSync().errors['bio']).toBeDefined();
  });
});
