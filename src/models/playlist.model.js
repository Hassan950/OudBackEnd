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
  },
  tracks: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Track',
  }],
  owner : {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'A playlist must have at an owner'
    }
  },
  collabrative: {
    type: Boolean,
    default:false
  },
  type: {
    type: String,
    enum: ['playlist']
  },
  public:{
    type: Boolean,
    default:false,
  }
  });
  const Playlist = mongoose.model('Playlist', playlistSchema);
  module.exports = { Playlist, playlistSchema };