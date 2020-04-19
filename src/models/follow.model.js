const mongoose = require('mongoose');

const followingsSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followedId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Artist', 'User']
  }
});

followingsSchema.index({ type: 1, userId: 1, followedId: 1 }, { unique: true });

const Followings = mongoose.model('Followings', followingsSchema);

const playlistFollowingsSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  playlistId: {
    type: mongoose.Types.ObjectId,
    ref: 'Playlist',
    required: true
  },
  public: {
    type: Boolean,
    default: true
  }
});

playlistFollowingsSchema.index({ userId: 1, playlistId: 1 }, { unique: true });

const PlaylistFollowings = mongoose.model(
  'PlaylistFollowings',
  playlistFollowingsSchema
);

module.exports = {
  followingsSchema,
  Followings,
  playlistFollowingsSchema,
  PlaylistFollowings
};
