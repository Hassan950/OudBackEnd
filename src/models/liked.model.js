const mongoose = require('mongoose');

const likedTracksSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trackId: {
    type: mongoose.Types.ObjectId,
    ref: 'Track',
    required: true
  },
  addedAt: {
    type: Date,
    required: true,
  }
});

likedTracksSchema.index({ userId: 1, trackId: 1 }, { unique: true });

const likedTracks = mongoose.model('likedTracks', likedTracksSchema);

const likedAlbumsSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  albumId: {
    type: mongoose.Types.ObjectId,
    ref: 'Album',
    required: true
  },
  addedAt: {
    type: Date,
    required: true,
  }
});

likedAlbumsSchema.index({ userId: 1, albumId: 1 }, { unique: true });

const likedAlbums = mongoose.model('likedAlbums', likedAlbumsSchema);

module.exports = {
  likedTracksSchema,
  likedTracks,
  likedAlbumsSchema,
  likedAlbums
};
