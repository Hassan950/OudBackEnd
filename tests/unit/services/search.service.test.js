const requestMocks = require('../../utils/request.mock.js');
const { searchService } = require('../../../src/services');
let { Recent , Playlist, Album, Artist,User,Track , Genre} = require('../../../src/models');
const mockingoose = require('mockingoose').default;

describe('library service', () => {
  let recent ;
  let recentarray;
  let playlist;
  let playlists;
  let track;
  let tracks;
  let album;
  let albums;
  let artist;
  let artists;
  let userr;
  let users;
  beforeEach(() => {
    userr = new User({
      displayName: 'test',
      verified: true,
      type: 'User',
      country: 'EG',
      email: 'test@gmail.com',
      username: 'lolxD'
    });
    users = [userr];
    artist = new Artist({
      displayName: 'Test artist',
      password: '12341234',
      passwordConfirm: '12341234',
      email: 'testing@gmail.com',
      username: 'test-man',
      country: 'EG',
      genres: [{ _id: '5e6c8ebb8b40fc5518fe8b32' }],
      images: [
        'uploads\\users\\default-Profile.jpg',
        'uploads\\users\\default-Cover.jpg'
      ],
      popularSongs: ['5e6c8ebb8b40fc5518fe8b3a'],
      bio: 'I am not a real artist I am just here for testing.'
    });
    artists = [artist] 
    album = new Album({
      album_type: 'single',
      album_group: 'compilation',
      artists: '5e909be7cfe5b521a0ccf3fe',
      genres: ['5e6c8ebb8b40fc5518fe8b32'],
      image: 'example.jpg',
      name: 'The Begining',
      release_date: '12-06-1999',
      tracks: ['5e909be7cfe5b521a0ccf3fd']
    });
    albums = [album];
    track = new Track ({
      name: 'mohamed',
      audioUrl: 'lol.mp3',
      artists: ['5e6c8ebb8b40fc7708fe8b32'],
      album: { _id: '5e6c8ebb8b40fc7708fe8b32', name: 'lol' },
      duration: 21000
    });
    tracks = [track];
    recent = new Recent({
      userId:'5e909be7cfe5b521a0ccf3ec',
      items:['5e909be7cfe5b521a0ccf3ed'],
      types:['playlist']
    });
    playlist = new Playlist({
      name: 'playlist1',
      public: true,
      collabrative: true,
      description: 'dsjbfjdbgjksdn',
      owner: '5e6c8ebb8b40fc7708fe8b74',
      tracks: '5e909be7cfe5b521a0ccf3ff',
      image: 'uploads\\default.jpg'
    });
    playlists = [playlist];
    recentarray = [recent];
  });

  describe('searchForPlaylists - test', () => {
    it('should return array of playlists ', async () => {
      query = {
        q:'i',
        type:'playlist',
        offset: 0,
        limit: 1
      }
      Playlist.select = jest.fn().mockReturnThis();
      Playlist.populate = jest.fn().mockReturnThis();
      Playlist.skip = jest.fn().mockReturnThis();
      Playlist.limit = jest.fn().mockReturnThis();
      mockingoose(Playlist).toReturn(playlists, 'find');
      mockingoose(Playlist).toReturn(1, 'countDocuments');
      const found = await searchService.search(query);
      expect(JSON.parse(JSON.stringify(found.playlists))).toEqual(JSON.parse(JSON.stringify(playlists)));
    });
  });
  describe('searchForTracks - test', () => {
    it('should return array of tracks ', async () => {
      query = {
        q:'i',
        type:'track',
        offset: 0,
        limit: 1
      }
      Track.select = jest.fn().mockReturnThis();
      Track.populate = jest.fn().mockReturnThis();
      Track.skip = jest.fn().mockReturnThis();
      Track.limit = jest.fn().mockReturnThis();
      mockingoose(Track).toReturn(tracks, 'find');
      mockingoose(Track).toReturn(1, 'countDocuments');
      const found = await searchService.search(query);
      expect(JSON.parse(JSON.stringify(found.tracks))).toEqual(JSON.parse(JSON.stringify(tracks)));
    });
  });
  describe('searchForAlbums - test', () => {
    it('should return array of albums ', async () => {
      query = {
        q:'i',
        type:'album',
        offset: 0,
        limit: 1
      }
      Album.select = jest.fn().mockReturnThis();
      Album.populate = jest.fn().mockReturnThis();
      Album.skip = jest.fn().mockReturnThis();
      Album.limit = jest.fn().mockReturnThis();
      mockingoose(Album).toReturn(albums, 'find');
      mockingoose(Album).toReturn(1, 'countDocuments');
      const found = await searchService.search(query);
      expect(JSON.parse(JSON.stringify(found.albums))).toEqual(JSON.parse(JSON.stringify(albums)));
    });
  });
  describe('searchForArtists - test', () => {
    it('should return array of artists ', async () => {
      query = {
        q:'i',
        type:'Artist',
        offset: 0,
        limit: 1
      }
      Artist.select = jest.fn().mockReturnThis();
      Artist.populate = jest.fn().mockReturnThis();
      Artist.skip = jest.fn().mockReturnThis();
      Artist.limit = jest.fn().mockReturnThis();
      mockingoose(Artist).toReturn(artists, 'find');
      mockingoose(Artist).toReturn(1, 'countDocuments');
      const found = await searchService.search(query);
      expect(JSON.parse(JSON.stringify(found.artists))).toEqual(JSON.parse(JSON.stringify(artists)));
    });
  })
  describe('searchForUsers - test', () => {
    it('should return array of users ', async () => {
      query = {
        q:'i',
        type:'User',
        offset: 0,
        limit: 1
      }
      User.select = jest.fn().mockReturnThis();
      User.populate = jest.fn().mockReturnThis();
      User.skip = jest.fn().mockReturnThis();
      User.limit = jest.fn().mockReturnThis();
      mockingoose(User).toReturn(users, 'find');
      mockingoose(User).toReturn(1, 'countDocuments');
      const found = await searchService.search(query);
      expect(JSON.parse(JSON.stringify(found.users))).toEqual(JSON.parse(JSON.stringify(users)));
    });
  })
  describe('search - test', () => {
    it('should return array of items of all types ', async () => {
      query = {
        q:'i',
        offset: 0,
        limit: 1
      }
      User.select = jest.fn().mockReturnThis();
      User.populate = jest.fn().mockReturnThis();
      User.skip = jest.fn().mockReturnThis();
      User.limit = jest.fn().mockReturnThis();
      mockingoose(User).toReturn(users, 'find');
      mockingoose(User).toReturn(1, 'countDocuments');
      Playlist.select = jest.fn().mockReturnThis();
      Playlist.populate = jest.fn().mockReturnThis();
      Playlist.skip = jest.fn().mockReturnThis();
      Playlist.limit = jest.fn().mockReturnThis();
      mockingoose(Playlist).toReturn(playlists, 'find');
      mockingoose(Playlist).toReturn(1, 'countDocuments');
      Album.select = jest.fn().mockReturnThis();
      Album.populate = jest.fn().mockReturnThis();
      Album.skip = jest.fn().mockReturnThis();
      Album.limit = jest.fn().mockReturnThis();
      mockingoose(Album).toReturn(albums, 'find');
      mockingoose(Album).toReturn(1, 'countDocuments');
      Artist.select = jest.fn().mockReturnThis();
      Artist.populate = jest.fn().mockReturnThis();
      Artist.skip = jest.fn().mockReturnThis();
      Artist.limit = jest.fn().mockReturnThis();
      mockingoose(Artist).toReturn(artists, 'find');
      mockingoose(Artist).toReturn(1, 'countDocuments');
      Track.select = jest.fn().mockReturnThis();
      Track.populate = jest.fn().mockReturnThis();
      Track.skip = jest.fn().mockReturnThis();
      Track.limit = jest.fn().mockReturnThis();
      mockingoose(Track).toReturn(tracks, 'find');
      mockingoose(Track).toReturn(1, 'countDocuments');
      const found = await searchService.search(query);
      expect(JSON.parse(JSON.stringify(found.users.users))).toEqual(JSON.parse(JSON.stringify(users)));
      expect(JSON.parse(JSON.stringify(found.playlists.playlists))).toEqual(JSON.parse(JSON.stringify(playlists)));
      expect(JSON.parse(JSON.stringify(found.tracks.tracks))).toEqual(JSON.parse(JSON.stringify(tracks)));
      expect(JSON.parse(JSON.stringify(found.artists.artists))).toEqual(JSON.parse(JSON.stringify(artists)));
      expect(JSON.parse(JSON.stringify(found.albums.albums))).toEqual(JSON.parse(JSON.stringify(albums)));
    });
  })
  describe('addToRecent - test', () => {
    it('should pass and add to recent ', async () => {
      user = {
        id:'5e909be7cfe5b521a0ccf3ee'
      }
      body = {
        id: '5e909be7cfe5b521a0ccf3ee',
        type: 'playlist'
      }
      mockingoose(Recent).toReturn(recentarray, 'find');
      await searchService.addToRecent(user,body);
    });
  })
  describe('getRecent - test', () => {
    it('should return array of recently searched items ', async () => {
      recent.items.push('5e909be7cfe5b521a0ccf3ee');
      recent.types.push('track');
      recent.items.push('5e909be7cfe5b521a0ccf3bb');
      recent.types.push('album');
      recent.items.push('5e909be7cfe5b521a0ccf3cc');
      recent.types.push('Artist');
      recent.items.push('5e909be7cfe5b522a0ccf3cc');
      recent.types.push('User');
      Playlist.populate = jest.fn().mockReturnThis();
      mockingoose(Playlist).toReturn(playlist, 'findOne');
      User.select = jest.fn().mockReturnThis();
      mockingoose(User).toReturn(userr, 'findOne');
      Artist.select = jest.fn().mockReturnThis();
      mockingoose(Artist).toReturn(artist, 'findOne');
      Album.populate = jest.fn().mockReturnThis();
      mockingoose(Album).toReturn(album, 'findOne');
      Track.populate = jest.fn().mockReturnThis();
      mockingoose(Track).toReturn(track, 'findOne');
      mockingoose(Recent).toReturn(recent, 'findOne');
      mockingoose(Recent).toReturn([{count:1}], 'aggregate');
      user = {
        id:'5e909be7cfe5b521a0ccf3ee'
      }
      query = {
        offset: 0,
        limit: 10
      }
      const found = await searchService.getRecent(user,query);
      expect(JSON.parse(JSON.stringify(found.items[0]))).toEqual(JSON.parse(JSON.stringify(playlist)));
      expect(JSON.parse(JSON.stringify(found.items[1]))).toEqual(JSON.parse(JSON.stringify(track)));
      expect(JSON.parse(JSON.stringify(found.items[2]))).toEqual(JSON.parse(JSON.stringify(album)));
      expect(JSON.parse(JSON.stringify(found.items[3]))).toEqual(JSON.parse(JSON.stringify(artist)));
      expect(JSON.parse(JSON.stringify(found.items[4]))).toEqual(JSON.parse(JSON.stringify(userr)));
    });
  })
});
