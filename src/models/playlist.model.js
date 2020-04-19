const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'playlist should have a name'],
    minlength: 1,
    maxlength: 20,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    minlength: 10,
    maxlength: 280
  },
  tracks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track'
    }
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  collabrative: {
    type: Boolean,
    default: false
  },
  public: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    match: /.(png|jpg|jpeg|svg)$/,
    default: 'uploads\\default.jpg'
  }
});

playlistSchema.virtual('type').get(function() {
  return 'playlist';
});

const Playlist = mongoose.model('Playlist', playlistSchema);
module.exports = { Playlist, playlistSchema };
