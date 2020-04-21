const trackService = require('../../../src/services/track.service');
const { Track } = require('../../../src/models/track.model');
const mockingoose = require('mockingoose').default;

describe('Get Track Audio Url', () => {
  let track;
  beforeEach(() => {
    track = track = {
      name: 'mohamed',
      audioUrl: 'lol.mp3',
      artists: ['5e6c8ebb8b40fc7708fe8b32'],
      album: { _id: '5e6c8ebb8b40fc7708fe8b32', name: 'lol' },
      duration: 21000
    };
    track.select = jest.fn().mockResolvedValue(track);
    Track.findById = jest.fn().mockReturnValue(track);
  });

  it('should select audioUrl', async () => {
    await trackService.getTrackAudioUrl('1');
    expect(track.select).toBeCalled();
    expect(track.select).toBeCalledWith('+audioUrl');
  });

  it('should return null if track is not found', async () => {
    track.select = jest.fn().mockResolvedValue(null);
    const result = await trackService.getTrackAudioUrl('1');
    expect(result).toBe(null);
  });

  it('should return null if track.audioUrl is not found', async () => {
    track.audioUrl = null;
    track.select = jest.fn().mockResolvedValue(track);
    const result = await trackService.getTrackAudioUrl('1');
    expect(result).toBe(null);
  });

  it('should return audioUrl', async () => {
    const result = await trackService.getTrackAudioUrl('1');
    expect(result).toBe(track.audioUrl);
  });
});