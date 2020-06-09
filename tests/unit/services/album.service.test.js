const albumService = require('../../../src/services/album.service');
let { Track, Album, Artist, Genre } = require('../../../src/models');
const mockingoose = require('mockingoose').default;
const AppError = require('../../../src/utils/AppError');
let fs = require('fs').promises;

artistIds = [
  '5e6c8ebb8b40fc5508fe8b32',
  '5e6c8ebb8b40fc6608fe8b32',
  '5e6c8ebb8b40fc7708fe8b32'
];
albumIds = [
  '5e6c8ebb8b40fc5508fe8b32',
  '5e6f6a7fac1d6d06f40706f2',
  '5e6c8ebb8b40fc5518fe8b32'
];

describe('album service', () => {
  let album;
  let albums;
  beforeEach(() => {
    album = new Album({
      _id: albumIds[0],
      album_type: 'single',
      album_group: 'compilation',
      artists: artistIds,
      genres: ['5e6c8ebb8b40fc5518fe8b32'],
      image: 'example.jpg',
      name: 'The Begining',
      release_date: '12-06-1999',
      tracks: [albumIds[0]]
    });
    album2 = new Album({
      _id: albumIds[1],
      album_type: 'single',
      album_group: 'compilation',
      artists: artistIds,
      genres: ['5e6c8ebb8b40fc5518fe8b32'],
      image: 'example.jpg',
      name: 'The Begining',
      release_date: '12-06-1999',
      tracks: [albumIds[0]]
    });
    albums = [album, album2];
    Album.schema.path('tracks', Object);
    Album.schema.path('artists', Object);
    Album.schema.path('genres', Object);
    Artist.schema.path('genres', Object);
    user = new Artist({
      country: 'EG',
      password: '12341234',
      passwordConfirm: '12341234',
      email: 'hh@lol.com',
      username: 'too much info',
      displayName: 'aaaah',
      genres: ['5e6c8ebb8b40fc5518fe8b32'],
      _id: album.artists[0],
      popularSongs: []
    });
  });

  describe('releaseAlbum', () => {
    it("Should return an error with status code 400 if album doesn't have an image", async () => {
      album.image = undefined;
      const result = await albumService.releaseAlbum(album, {});
      expect(result.statusCode).toBe(400);
    });
    it("Should return an error with status code 400 if any of the album tracks doesn't have a file", async () => {
      album.tracks[0] = { _id: albumIds[0] };
      album.image = 'lol.jpg';
      const result = await albumService.releaseAlbum(album, {});
      expect(result.statusCode).toBe(400);
    });
    it('Should return an error with status code 400 if album is single and has more than 1 song', async () => {
      album.tracks = [
        { _id: albumIds[0], audioUrl: 'lol.mp3' },
        { _id: albumIds[1], audioUrl: 'loltany.mp3' }
      ];
      album.album_type = 'single';
      const result = await albumService.releaseAlbum(album, {});
      expect(result.statusCode).toBe(400);
    });
    it('Should return and release the album if it is ready for release', async () => {
      album.tracks = [{ _id: albumIds[0], audioUrl: 'lol.mp3' }];
      album.album_type = 'single';

      mockingoose(Album)
        .toReturn([{ _id: albumIds[0], tracks: 3 }], 'aggregate')
        .toReturn(album, 'save');
      mockingoose(Artist).toReturn(user, 'save');
      result = await albumService.releaseAlbum(album, user);

      expect(result).toHaveProperty('tracks');
    });
  });

  describe('findArtistAlbums', () => {
    it('Should return all albums of the artist if he is the user', async () => {
      groups = ['single', 'appears_on'];
      mockingoose(Album)
        .toReturn(albums, 'find')
        .toReturn(2, 'countDocuments');
      const result = await albumService.findArtistAlbums(
        user._id,
        50,
        0,
        groups,
        user
      );
      expect(result).toContain(4);
      expect(result[0][0]).toHaveProperty('released');
    });
    it('Should return all albums of the artist if he is the user', async () => {
      groups = ['single', 'appears_on'];
      mockingoose(Album)
        .toReturn(albums, 'find')
        .toReturn(2, 'countDocuments');
      const result = await albumService.findArtistAlbums(
        user._id,
        2,
        0,
        groups,
        user
      );
      expect(result).toContain(4);
      expect(result[0][0]).toHaveProperty('released');
      expect(result[0].length).toBe(2);
    });
  });

  describe('deleteImage', () => {
    it('Should throw an error if file system threw an error otherwise ENOENT', async () => {
      fs.unlink = jest.fn().mockImplementation(() => {
        throw { code: 'not ENOENT'};
      })
      expect(albumService.deleteImage('lol.jpg')).rejects.toThrow();
    })
  })
});
