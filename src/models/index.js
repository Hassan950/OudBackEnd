const { User, userSchema } = require('./user.model');
const { Artist, artistSchema } = require('./artist.model');
const { Track, trackSchema } = require('./track.model');
const { Album, albumSchema } = require('./album.model');
const { Genre, genreSchema } = require('./genre.model');
const { Device, deviceSchema } = require('./device.model');

module.exports = {
  User,
  userSchema,
  Artist,
  artistSchema,
  Track,
  trackSchema,
  Album,
  albumSchema,
  Genre,
  genreSchema
  Device,
  deviceSchema
};
