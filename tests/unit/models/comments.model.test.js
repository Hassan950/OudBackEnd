const commentMocks = require('../../utils/models/comments.model.mocks');

describe('AlbumComments model', () => {
  let albumComment;
  beforeEach(() => {
    albumComment = commentMocks.createFakeStoredAlbumComment();
  });
  describe('AlbumComment model - userName', () => {
    it('should throw error if userName not string', () => {
      const args = [null, undefined];
      args.forEach(a => {
        albumComment.userName = a;
        const error = albumComment.validateSync();
        expect(error.errors['userName']).toBeDefined();
      });
    });
  });
  describe('AlbumComment model - AlbumID', () => {
    it('should throw error if AlbumID not Id object', () => {
      const args = [null, undefined];
      args.forEach(a => {
        albumComment.albumId = a;
        const error = albumComment.validateSync();
        expect(error.errors['albumId']).toBeDefined();
      });
    });
  });
  describe('AlbumComment model - comment', () => {
    it('should throw error if comment not string', () => {
      const args = [null, undefined];
      args.forEach(a => {
        albumComment.comment = a;
        const error = albumComment.validateSync();
        expect(error.errors['comment']).toBeDefined();
      });
    });
  });
});
