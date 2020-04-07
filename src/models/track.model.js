const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema(
  {
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
      default: 'default.mp3',
      select: false
    },
    duration: {
      type: Number,
      min: 20000,
      default: 20000
    },
    views: {
      type: Number,
      default: 0
    }
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

trackSchema.virtual('type').get(function() {
  return 'track';
});

trackSchema.virtual('albumId').get(function() {
  return (this.album && this.album._id) ? this.album._id : undefined;
});

const Track = mongoose.model('Track', trackSchema);

module.exports = { Track, trackSchema };
