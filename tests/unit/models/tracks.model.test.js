const { Track } = require('../../../src/models');

describe('Track model', () => {
  let track;
  // Start each test with a valid object to check only one property
  beforeEach(() => {
    track = new Track({
      name: 'Louder',
      artists: '5e6c8ebb8b40fc5508fe8b32',
      album: '5e6c8ebb8b40fc5508fe8b32',
      audioUrl: 'data/tracks/louder.mp3',
      duration: 21000
    });
  });
  it('Should return undefined when validating a valid track', () => {
    expect(track.validateSync()).toBeUndefined();
  });
  it('Should throw an error if no name passed', () => {
    track.name = null;
    expect(track.validateSync().errors['name']).toBeDefined();
  });
  it('Should throw an error if name is empty', () => {
    track.name = '';
    expect(track.validateSync().errors['name']).toBeDefined();
  });
  it('Should throw an error if name is longer than 30 character', () => {
    track.name = 'more than thirty character long ';
    expect(track.validateSync().errors['name']).toBeDefined();
  });
  it("Should throw an error if no artists ID's were passed (empty list or no list at all)", () => {
    track.artists = null;
    expect(track.validateSync().errors['artists']).toBeDefined();
    track.artists = [];
    expect(track.validateSync().errors['artists']).toBeDefined();
  });
  it('Should throw an error if no album is passed', () => {
    track.album = null;
    expect(track.validateSync().errors['album']).toBeDefined();
  });
  it("Should throw an error if audioUrl doesn't match mp3 format files", () => {
    track.audioUrl = 'not mp3';
    expect(track.validateSync().errors['audioUrl']).toBeDefined();
  });
  it('Should throw an error if duration is not a number', () => {
    track.duration = '4lol9';
    expect(track.validateSync().errors['duration']).toBeDefined();
  });
});
