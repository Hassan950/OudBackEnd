const { Artist } = require('../../../src/models');

describe('Artist model', () => {
  let artist;
  beforeEach(() => {
    artist = new Artist({
      country: 'EG',
      displayName: 'Mohamed',
      username: 'hassan',
      email: 'lol.9@xd.com',
      password: '12345678',
      passwordConfirm: '12345678',
      role: 'artist',
      genres: '5e6c8ebb8b40fc5508fe8b32',
      bio: 'not longer than 255',
      popularSongs: ['5e6c8ebb8b40fc5508fe8b32']
    });
  });
  it('Should return undefined when validating a valid artist', () => {
    expect(artist.validateSync()).toBeUndefined();
  });
  it("Should throw an error if no genre ID's were passed (empty list or no list at all)", () => {
    artist.genres = null;
    expect(artist.validateSync().errors['genres']).toBeDefined();
    artist.genres = [];
    expect(artist.validateSync().errors['genres']).toBeDefined();
  });
  it('Should throw an error if bio is longer than 255 characters', () => {
    artist.bio =
      'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. I am so happy,';
    expect(artist.validateSync().errors['bio']).toBeDefined();
  });
  it('Should throw an error is the role is not artist', () => {
    artist.role = 'lolxD';
    expect(artist.validateSync().errors['role']).toBeDefined();
  });
  it('Should not throw error when role is artist', () => {
    artist.role = 'artist';
    expect(artist.validateSync()).toBeUndefined();
  });
  it("Should throw an error if the elements of the popularSongs are not ID's", () => {
    artist.popularSongs = 'invalid Id';
    expect(artist.validateSync().errors['popularSongs']).toBeDefined();
  });
});
