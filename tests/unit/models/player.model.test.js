const playerMocks = require('../../utils/models/player.model.mocks');

describe('Player model', () => {
  let player;
  beforeEach(() => {
    player = playerMocks.createFakePlayer();
  });

  describe('Player model - userId', () => {
    it('should be required', () => {
      const args = [null, undefined];
      args.forEach(a => {
        player.userId = a;
        const error = player.validateSync();
        expect(error.errors['userId']).toBeDefined();
      });
    });
  });

  describe('Player model - repeatState', () => {
    it('should be [off, track, context] only', () => {
      const args = ['off', 'track', 'context'];
      args.forEach(a => {
        player.repeatState = a;
        const error = player.validateSync();
        expect(error).toBeUndefined();
      });
      player.repeatState = 'a';
      const error = player.validateSync();
      expect(error.errors['repeatState']).toBeDefined();
    });
  });

  describe('Player model - currentlyPlayingType', () => {
    it('should be [track, ad, unknown] only', () => {
      const args = ['track', 'ad', 'unknown'];
      args.forEach(a => {
        player.currentlyPlayingType = a;
        const error = player.validateSync();
        expect(error).toBeUndefined();
      });
      player.currentlyPlayingType = 'a';
      const error = player.validateSync();
      expect(error.errors['currentlyPlayingType']).toBeDefined();
    });
  });

  describe('Player model - context.type', () => {
    it('should be [album, artist, playlist, unknown] only', () => {
      const args = ['album', 'artist', 'playlist', 'unknown'];
      args.forEach(a => {
        player.context.type = a;
        const error = player.validateSync();
        expect(error).toBeUndefined();
      });
      player.context.type = 'a';
      const error = player.validateSync();
      expect(error.errors['context.type']).toBeDefined();
    });
  });
});