const playHistoryMocks = require('../../utils/models/playHistory.model.mocks');

describe('PlayHistory model', () => {
  let playHistory;
  beforeEach(() => {
    playHistory = playHistoryMocks.createFakePlayHistory();
  });
  describe('PlayHistory model - user', () => {
    it('should be required', () => {
      const args = [null, undefined];
      args.forEach(a => {
        playHistory.user = a;
        const error = playHistory.validateSync();
        expect(error.errors['user']).toBeDefined();
      });
    });
  });

  describe('PlayHistory model - context.type', () => {
    it('should be [Album, Artist, Playlist] only', () => {
      const args = ['Album', 'Artist', 'Playlist'];
      args.forEach(a => {
        playHistory.context.type = a;
        const error = playHistory.validateSync();
        expect(error).toBeUndefined();
      });
      playHistory.context.type = 'a';
      const error = playHistory.validateSync();
      expect(error.errors['context.type']).toBeDefined();
    });
  });
});