const { User, userSchema } = require('./user.model');
const { Artist, artistSchema } = require('./artist.model');
const { Track, trackSchema } = require('./track.model');
const { Album, albumSchema } = require('./album.model');
const { Category , categorySchema} = require('./category.model');
const { Playlist, playlistSchema} = require('./playlist.model');
const { Genre, genreSchema } = require('./genre.model');
const { Device, deviceSchema } = require('./device.model');
const { likedTracks, likedTracksSchema , likedAlbums, likedAlbumsSchema} = require('./liked.model');

module.exports = {
  User,
  userSchema,
  Artist,
  artistSchema,
  Track,
  trackSchema,
  Album,
  albumSchema,
  Category,
  categorySchema,
  Playlist,
  playlistSchema,
  Genre,
  genreSchema,
  Device,
  deviceSchema,
  likedTracks,
  likedTracksSchema,
  likedAlbums,
  likedAlbumsSchema
};
