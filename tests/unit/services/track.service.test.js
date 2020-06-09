const trackService = require('../../../src/services/track.service');
let { Track, Artist, Genre } = require('../../../src/models');
const mockingoose = require('mockingoose').default;
let fs = require('fs').promises;

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

ids = [
  '5e6c8ebb8b40fc5508fe8b32',
  '5e6f6a7fac1d6d06f40706f2',
  '5e6c8ebb8b40fc5518fe8b32'
];

artistIds = [
  { _id: '5e6c8ebb8b40fc5508fe8b32' },
  { _id: '5e6c8ebb8b40fc6608fe8b32' },
  { _id: '5e6c8ebb8b40fc7708fe8b32' }
];

describe('track service', () => {
  let user;
  let track;
  beforeEach(() => {
    track = {
      name: 'mohamed',
      audioUrl: 'lol.mp3',
      artists: artistIds,
      _id: '5edfa612a9830c3cac065ce8',
      album: {
        _id: '5e6c8ebb8b40fc7708fe8b32',
        name: 'lol',
        artists: [...artistIds],
        released: false
      },
      duration: 21000
    };
    anotherTrack = {
      name: 'another mohamed',
      audioUrl: 'lol.mp3',
      artists: artistIds,
      _id: '5edfa612a9830c3cac065ce7',
      album: {
        _id: '5e6c8ebb8b40fc7708fe8b32',
        name: 'lol',
        artists: [...artistIds],
        released: false
      },
      duration: 21000
    };
    tracks = [track, anotherTrack];
    Track.schema.path('artists', Object);
    Track.schema.path('album', Object);
  });

  describe('findTracks', () => {
    it("Should return null against tracks of albums that are released but doesn't belong to the current user", async () => {
      tracks[1].album.artists[0] = artistIds[1];
      mockingoose(Track).toReturn(tracks, 'find');
      user = { _id: artistIds[0]._id };

      tracks = await trackService.findTracks([track._id, tracks[1]._id], user);
      expect(tracks[0]).toHaveProperty('name');
      expect(tracks[1]).toBe(null);
    });
  });

  describe('deleteTrack', () => {
    it('Should throw an error if file system threw an error otherwise ENONET', async () => {
      mockingoose(Track).toReturn(track, 'findOneAndDelete');
      fs.unlink = jest.fn().mockImplementation(lol => {
        throw { code: 'not ENOENT' };
      });

      expect(trackService.deleteTrack(track.id)).rejects.toThrow();
    });
  });

  describe('checkFile', () => {
    it('Should throw an error if file system threw an error otherwise ENONET', async () => {
      mockingoose(Track).toReturn(track, 'findOneAndDelete');
      fs.unlink = jest.fn().mockImplementation(lol => {
        throw { code: 'not ENOENT' };
      });

      expect(trackService.checkFile(track.id)).rejects.toThrow();
    });
  });

  describe('artistTracksExist', () => {
    it('Should return an error with status code 400 if the tracks albums are not released', async () => {
      mockingoose(Track).toReturn([track], 'find');
      const id = await trackService.artistTracksExist(artistIds[0]._id, [
        track._id
      ]);
      expect(id.statusCode).toBe(400);
    });
  });
});
