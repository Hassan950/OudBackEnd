const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 1,
    maxlength: 30,
    required: true,
    trim: true
  },
  artists: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'A track must have at least one artist'
    }
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
    required: true
  },
  audioUrl: {
    type: String,
    required: true,
    match: /\.mp3$/,
    unique: true
  },
  duration: {
    type: Number,
    min: 5000,
    default: 10000
  },
  views: {
    type: Number,
    default: 0
  }
});

const Track = mongoose.model('Track', trackSchema);

module.exports = { Track, trackSchema };
