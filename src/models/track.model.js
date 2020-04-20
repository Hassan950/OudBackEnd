const mongoose = require('mongoose');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

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
      match: /\.mp3$/,
      select: false
    },
    duration: {
      type: Number
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

trackSchema.plugin(mongooseLeanVirtuals)

const Track = mongoose.model('Track', trackSchema);

module.exports = { Track, trackSchema };
