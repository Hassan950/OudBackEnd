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

      result = await trackService.findTracks([track._id, tracks[1]._id], user);
      expect(result[0]).toHaveProperty('name');
      expect(result[1]).toBe(null);
    });
    it('Should return albums if they are released', async () => {
      tracks[0].album.released = true;
      mockingoose(Track).toReturn(tracks, 'find');
      user = { _id: artistIds[0]._id };
      const result = await trackService.findTracks(
        [track._id, tracks[1]._id],
        user
      );
      expect(result[0]).toHaveProperty('name');
    });
  });

  describe('deleteTrack', () => {
    it('Should throw an error if file system threw an error otherwise ENONET', async () => {
      check = jest.fn();
      mockingoose(Track).toReturn(track, 'findOneAndDelete');
      fs.unlink = jest.fn().mockImplementationOnce(lol => {
        throw { code: 'not ENOENT' };
      });
      try {
        await trackService.deleteTrack(track.id);
      } catch (err) {
        expect(err).toBeDefined();
        check();
      }
      expect(check).toBeCalled();
    });
    it("Should do nothing if the audioUrl doesn't exist", async () => {
      track.audioUrl = undefined;
      mockingoose(Track).toReturn(track, 'findOneAndDelete');
      fs.unlink = jest.fn().mockImplementationOnce(lol => {
        throw { code: 'not ENOENT' };
      });
      await trackService.deleteTrack('id');
      expect(fs.unlink).not.toHaveBeenCalled();
    });
    it('Should do nothing if the error is ENOENT', async () => {
      check = jest.fn();
      mockingoose(Track).toReturn(track, 'findOneAndDelete');
      fs.unlink = jest.fn().mockImplementationOnce(lol => {
        throw { code: 'ENOENT' };
      });
      try {
        await trackService.deleteTrack(track.id);
      } catch (err) {
        expect(err).toBeDefined();
        check();
      }
      expect(check).not.toHaveBeenCalled();
    });
  });

  describe('checkFile', () => {
    it('Should throw an error if file system threw an error otherwise ENONET', async () => {
      check = jest.fn();
      mockingoose(Track).toReturn(track, 'findOneAndDelete');
      fs.unlink = jest.fn().mockImplementationOnce(lol => {
        throw { code: 'not ENOENT' };
      });
      try {
        await trackService.checkFile(track.id);
      } catch (err) {
        expect(err).toBeDefined();
        check();
      }
      expect(check).toBeCalled();
    });
    it('Should do nothing if audioUrl doesn\'t exist', async () => {
      Track.findById = jest.fn().mockImplementationOnce(() => {
        return {select: jest.fn().mockReturnThis()};
      })
      fs.unlink = jest.fn().mockImplementationOnce();
      await trackService.checkFile('id');
      expect(fs.unlink).not.toHaveBeenCalled();
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
    it('Should not change tracksIds if it is more than or equal to 5', async () => {
      track.album.released = true;
      mockingoose(Track).toReturn([track, track, track, track, track], 'find');
      const result = await trackService.artistTracksExist(artistIds[0]._id, [
        1,
        2,
        3,
        4,
        5
      ]);
      expect(result.length).toBe(5);
    });
  });
});
