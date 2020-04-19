const likedTracksMocks = require('../../utils/models/likedTracks.model.mocks');

describe('likedTracks model', () => {
  let likedTrack;
  beforeEach(() => {
    likedTrack = likedTracksMocks.createFakeStoredLikedTrack();
  });
  describe('likedTracks model - userId', () => {
    it('should throw error if no userId passed', () => {
      const args = [null, undefined];
      args.forEach(a => {
        likedTrack.userId = a;
        const error = likedTrack.validateSync();
        expect(error.errors['userId']).toBeDefined();
      });
    });
  });
  describe('likedTracks model - Track', () => {
    it('should throw error if no Track passed', () => {
      const args = [null, undefined];
      args.forEach(a => {
        likedTrack.track = a;
        const error = likedTrack.validateSync();
        expect(error.errors['track']).toBeDefined();
      });
    });
  });
  describe('likedTracks model - addedAt', () => {
    it('should throw error if no Track passed', () => {
      const args = [null, undefined];
      args.forEach(a => {
        likedTrack.addedAt = a;
        const error = likedTrack.validateSync();
        expect(error.errors['addedAt']).toBeDefined();
      });
    });
  });
});
