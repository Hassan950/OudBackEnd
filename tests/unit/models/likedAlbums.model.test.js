const likedAlbumsMocks = require('../../utils/models/likedAlbums.model.mocks');

describe('likedAlbums model', () => {
  let likedAlbum;
  beforeEach(() => {
    likedAlbum = likedAlbumsMocks.createFakeStoredLikedAlbum();
  });
  describe('likedAlbums model - userId', () => {
    it('should throw error if no userId passed', () => {
      const args = [null, undefined];
      args.forEach(a => {
        likedAlbum.userId = a;
        const error = likedAlbum.validateSync();
        expect(error.errors['userId']).toBeDefined();
      });
    });
  });
  describe('likedAlbums model - Album', () => {
    it('should throw error if no Album passed', () => {
      const args = [null, undefined];
      args.forEach(a => {
        likedAlbum.album = a;
        const error = likedAlbum.validateSync();
        expect(error.errors['album']).toBeDefined();
      });
    });
  });
  describe('likedAlbums model - addedAt', () => {
    it('should throw error if no Track passed', () => {
      const args = [null, undefined];
      args.forEach(a => {
        likedAlbum.addedAt = a;
        const error = likedAlbum.validateSync();
        expect(error.errors['addedAt']).toBeDefined();
      });
    });
  });
});
