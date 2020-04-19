const { User, userSchema } = require('./user.model');
const { Normal, normalSchema } = require('./normal.model');
const { Artist, artistSchema } = require('./artist.model');
const { Track, trackSchema } = require('./track.model');
const { Album, albumSchema } = require('./album.model');
const { Category, categorySchema } = require('./category.model');
const { Playlist, playlistSchema } = require('./playlist.model');
const { Genre, genreSchema } = require('./genre.model');
const { Device, deviceSchema } = require('./device.model');
const { Player, playerSchema } = require('./player.model');
const { PlayHistory, playHistorySchema } = require('./playHistory.model');
const { Queue, queueSchema } = require('./queue.model');
const {
  Followings,
  followingsSchema,
  playlistFollowingsSchema,
  PlaylistFollowings
} = require('./follow.model');
const { Request, requestSchema } = require('./request.model');

module.exports = {
  User,
  userSchema,
  Normal,
  normalSchema,
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
  Player,
  playerSchema,
  PlayHistory,
  playHistorySchema,
  Queue,
  queueSchema,
  Followings,
  followingsSchema,
  playlistFollowingsSchema,
  PlaylistFollowings,
  playlistSchema,
  Playlist,
  Request,
  requestSchema
};
