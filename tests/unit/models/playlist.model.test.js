const playlistMocks = require('../../utils/models/playlist.model.mocks');

describe('Playlist model', () => {
  let playlist;
  beforeEach(() => {
    playlist = playlistMocks.createFakePlaylist();
  });
  describe('Playlist model - name', () => {
    it('should throw error if no name passed', () => {
      const args = [null, undefined];
      args.forEach(a => {
        playlist.name = a;
        const error = playlist.validateSync();
        expect(error.errors['name']).toBeDefined();
      });
    });
    it('should thorw error if name is more than 20 chars', () => {
      playlist.name = new Array(21).fill('1');
      const error = playlist.validateSync();
      expect(error.errors['name']).toBeDefined();
    });
  });
  describe('playlist model - description', () => {
    it('should throw error if description less than 25', () => {
      playlist.description = '123';
      const error = playlist.validateSync();
      expect(error.errors['description']).toBeDefined();
    });
    it('should thorw error if name is more than 20 chars', () => {
      playlist.description = new Array(21).fill('1');
      const error = playlist.validateSync();
      expect(error.errors['description']).toBeDefined();
    });
  });
  describe('Playlist model - owner', () => {
    it('should throw error if no owner passed', () => {
      const args = [null, undefined];
      args.forEach(a => {
        playlist.owner = a;
        const error = playlist.validateSync();
        expect(error.errors['owner']).toBeDefined();
      });
    });
  });
  it('Should return undefined when validating a valid playlist', () => {
    expect(playlist.type).toBe("playlist");
  });
});
