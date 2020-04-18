const mongoose = require('mongoose');

const likedTracksSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  track: {
    type: mongoose.Types.ObjectId,
    ref: 'Track',
    required: true
  },
  addedAt: {
    type: Date,
    required: true,
  }
});

likedTracksSchema.index({ userId: 1, track: 1 }, { unique: true });

const likedTracks = mongoose.model('likedTracks', likedTracksSchema);

const likedAlbumsSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  album: {
    type: mongoose.Types.ObjectId,
    ref: 'Album',
    required: true
  },
  addedAt: {
    type: Date,
    required: true,
  }
});

likedAlbumsSchema.index({ userId: 1, album: 1 }, { unique: true });

const likedAlbums = mongoose.model('likedAlbums', likedAlbumsSchema);

module.exports = {
  likedTracksSchema,
  likedTracks,
  likedAlbumsSchema,
  likedAlbums
};
