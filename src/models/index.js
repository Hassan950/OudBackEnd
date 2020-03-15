const { User, userSchema } = require('./user.model');
const { Artist, artistSchema } = require('./artist.model');
const { Track, trackSchema } = require('./track.model');
const { Album, albumSchema } = require('./album.model');
const {Category , categorySchema} = require('./category.model');
const {Playlist, playlistSchema} = require('./playlist.model');

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
  playlistSchema
};
