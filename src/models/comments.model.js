const mongoose = require('mongoose');

const playlistCommentsSchema = mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  playlistId: {
    type: mongoose.Types.ObjectId,
    ref: 'Playlist',
    required: true
  },
  comment: {
    type: String,
    minlength: 1,
    maxlength: 200,
    trim: true,
    required: true,
  }
});

const PlaylistComments = mongoose.model('playlistComments', playlistCommentsSchema);

const albumCommentsSchema = mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  albumId: {
    type: mongoose.Types.ObjectId,
    ref: 'Album',
    required: true
  },
  comment: {
    type: String,
    minlength: 1,
    maxlength: 200,
    trim: true,
    required: true,
  }
});

const AlbumComments = mongoose.model('albumComments', albumCommentsSchema);

module.exports = {
  playlistCommentsSchema,
  PlaylistComments,
  albumCommentsSchema,
  AlbumComments
};
